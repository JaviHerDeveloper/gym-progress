import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { createCreateSessionService } from './session.service.js';
import { SESSION_DURATION_MS } from './session-token.js';
import type { CreateSessionPersistenceInput, SessionRepository } from './session.types.js';

class RecordingSessionRepository implements SessionRepository {
  readonly sessions: CreateSessionPersistenceInput[] = [];

  async createSession(input: CreateSessionPersistenceInput): Promise<void> {
    this.sessions.push(input);
  }
}

test('creates a valid session from exactly 32 random bytes', async () => {
  const repository = new RecordingSessionRepository();
  const requestedSizes: number[] = [];
  const createSession = createCreateSessionService({
    repository,
    randomBytes: (size) => {
      requestedSizes.push(size);
      return Buffer.alloc(size, 0x5a);
    },
  });

  const result = await createSession('user-1');

  assert.deepEqual(requestedSizes, [32]);
  assert.match(result.token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(repository.sessions.length, 1);
});

test('persists only the SHA-256 hexadecimal hash and never the original token', async () => {
  const repository = new RecordingSessionRepository();
  const createSession = createCreateSessionService({
    repository,
    randomBytes: () => Buffer.alloc(32, 0x42),
  });

  const result = await createSession('user-1');
  const persistedSession = repository.sessions[0];

  assert.ok(persistedSession);
  assert.equal(persistedSession.tokenHash, createHash('sha256').update(result.token).digest('hex'));
  assert.match(persistedSession.tokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(result.token, persistedSession.tokenHash);
  assert.deepEqual(Object.keys(persistedSession).sort(), ['expiresAt', 'tokenHash', 'userId']);
  assert.equal('token' in persistedSession, false);
});

test('sets the expiration exactly 90 fixed days from the injected clock', async () => {
  const repository = new RecordingSessionRepository();
  const createdAt = new Date('2026-01-02T03:04:05.000Z');
  const createSession = createCreateSessionService({
    repository,
    now: () => createdAt,
    randomBytes: () => Buffer.alloc(32, 0x33),
  });

  const result = await createSession('user-1');

  assert.equal(result.expiresAt.getTime(), createdAt.getTime() + SESSION_DURATION_MS);
  assert.equal(repository.sessions[0]?.expiresAt.getTime(), result.expiresAt.getTime());
});

test('creates different tokens for consecutive sessions', async () => {
  const repository = new RecordingSessionRepository();
  const createSession = createCreateSessionService({ repository });

  const firstSession = await createSession('user-1');
  const secondSession = await createSession('user-1');

  assert.notEqual(firstSession.token, secondSession.token);
  assert.notEqual(repository.sessions[0]?.tokenHash, repository.sessions[1]?.tokenHash);
});
