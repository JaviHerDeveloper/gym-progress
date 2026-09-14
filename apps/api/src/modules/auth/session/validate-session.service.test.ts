import assert from 'node:assert/strict';
import test from 'node:test';

import { createSessionToken } from './session-token.js';
import { createValidateSessionService } from './validate-session.service.js';
import type { SessionValidationRepository, ValidatedSession } from './session.types.js';

const now = new Date('2026-01-02T03:04:05.000Z');
const validSession: ValidatedSession = {
  user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  session: { id: 'session-1', expiresAt: new Date('2026-01-02T03:04:06.000Z') },
};

class RecordingValidationRepository implements SessionValidationRepository {
  readonly tokenHashes: string[] = [];

  constructor(private readonly result: ValidatedSession | null) {}

  async findSessionByTokenHash(tokenHash: string): Promise<ValidatedSession | null> {
    this.tokenHashes.push(tokenHash);
    return this.result;
  }
}

test('validates a session and returns only safe user and session data', async () => {
  const repository = new RecordingValidationRepository(validSession);
  const validateSession = createValidateSessionService({ repository, now: () => now });

  const result = await validateSession('valid-token');

  assert.deepEqual(result, validSession);
  assert.doesNotMatch(JSON.stringify(result), /tokenHash|passwordHash/i);
});

test('hashes the original token before calling the repository using the creation primitive', async () => {
  const preparedSession = createSessionToken({
    now: () => now,
    randomBytes: () => Buffer.alloc(32, 0x7a),
  });
  const repository = new RecordingValidationRepository(validSession);
  const validateSession = createValidateSessionService({ repository, now: () => now });

  await validateSession(preparedSession.token);

  assert.deepEqual(repository.tokenHashes, [preparedSession.tokenHash]);
  assert.notEqual(repository.tokenHashes[0], preparedSession.token);
});

test('returns null for an unknown token', async () => {
  const repository = new RecordingValidationRepository(null);
  const validateSession = createValidateSessionService({ repository, now: () => now });

  assert.equal(await validateSession('unknown-token'), null);
});

test('returns null for expired sessions and sessions expiring exactly now', async () => {
  for (const expiresAt of [
    new Date(now.getTime() - 1),
    new Date(now.getTime()),
  ]) {
    const repository = new RecordingValidationRepository({
      ...validSession,
      session: { ...validSession.session, expiresAt },
    });
    let nowCalls = 0;
    const validateSession = createValidateSessionService({
      repository,
      now: () => {
        nowCalls += 1;
        return now;
      },
    });

    assert.equal(await validateSession('expired-token'), null);
    assert.equal(nowCalls, 1);
  }
});

test('returns null without querying the repository for empty or whitespace tokens', async () => {
  for (const token of ['', '   ']) {
    const repository = new RecordingValidationRepository(validSession);
    const validateSession = createValidateSessionService({ repository, now: () => now });

    assert.equal(await validateSession(token), null);
    assert.deepEqual(repository.tokenHashes, []);
  }
});
