import assert from 'node:assert/strict';
import test from 'node:test';

import { createInvalidateSessionService } from './invalidate-session.service.js';
import { hashSessionToken } from './session-token.js';
import type { SessionInvalidationRepository } from './session.types.js';

class RecordingInvalidationRepository implements SessionInvalidationRepository {
  readonly tokenHashes: string[] = [];

  constructor(private readonly error?: Error) {}

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    if (this.error) {
      throw this.error;
    }

    this.tokenHashes.push(tokenHash);
  }
}

test('hashes the original token and deletes only the matching session', async () => {
  const repository = new RecordingInvalidationRepository();
  const invalidateSession = createInvalidateSessionService({ repository });
  const token = ' token-with-significant-spaces ';

  await invalidateSession(token);

  assert.deepEqual(repository.tokenHashes, [hashSessionToken(token)]);
  assert.notEqual(repository.tokenHashes[0], hashSessionToken(token.trim()));
});

test('treats an unknown token as a successful idempotent invalidation', async () => {
  const repository = new RecordingInvalidationRepository();
  const invalidateSession = createInvalidateSessionService({ repository });

  await assert.doesNotReject(() => invalidateSession('unknown-token'));
  assert.deepEqual(repository.tokenHashes, [hashSessionToken('unknown-token')]);
});

test('does not query persistence for empty or whitespace-only tokens', async () => {
  for (const token of ['', '   ']) {
    const repository = new RecordingInvalidationRepository();
    const invalidateSession = createInvalidateSessionService({ repository });

    await assert.doesNotReject(() => invalidateSession(token));
    assert.deepEqual(repository.tokenHashes, []);
  }
});

test('does not translate unexpected repository errors', async () => {
  const repositoryError = new Error('PostgreSQL connection failed.');
  const repository = new RecordingInvalidationRepository(repositoryError);
  const invalidateSession = createInvalidateSessionService({ repository });

  await assert.rejects(() => invalidateSession('valid-token'), repositoryError);
});
