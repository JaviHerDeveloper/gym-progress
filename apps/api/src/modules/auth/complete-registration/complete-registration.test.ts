import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { EmailAlreadyExistsError } from '../register/register.errors.js';
import { SESSION_DURATION_MS } from '../session/session-token.js';

import { createRegisterUserWithInitialSessionService } from './complete-registration.service.js';
import type {
  CompleteRegistrationRepository,
  CreateCompleteRegistrationPersistenceInput,
} from './complete-registration.types.js';

const validInput = {
  name: '  Ada Lovelace  ',
  email: '  ADA@EXAMPLE.COM  ',
  password: 'correct-horse-battery-staple',
  heightCm: 165.5,
  weightKg: 61.25,
};

class RecordingCompleteRegistrationRepository implements CompleteRegistrationRepository {
  readonly calls: CreateCompleteRegistrationPersistenceInput[] = [];

  async createRegistrationWithInitialSession(input: CreateCompleteRegistrationPersistenceInput) {
    this.calls.push(input);
    return { id: 'user-1', name: input.registration.name, email: input.registration.email };
  }
}

test('creates a complete registration with safe normalized output in one persistence unit', async () => {
  const repository = new RecordingCompleteRegistrationRepository();
  const createdAt = new Date('2026-01-02T03:04:05.000Z');
  const registerUserWithInitialSession = createRegisterUserWithInitialSessionService({
    repository,
    hashPassword: async () => 'argon2id-hash',
    now: () => createdAt,
    randomBytes: () => Buffer.alloc(32, 0x61),
  });

  const result = await registerUserWithInitialSession(validInput);
  const persisted = repository.calls[0];

  assert.deepEqual(result.user, { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.equal(result.session.expiresAt.getTime(), createdAt.getTime() + SESSION_DURATION_MS);
  assert.equal(repository.calls.length, 1);
  assert.ok(persisted);
  assert.deepEqual(Object.keys(persisted.initialSession).sort(), ['expiresAt', 'tokenHash']);
  assert.equal('token' in persisted.initialSession, false);
  assert.equal(
    persisted.initialSession.tokenHash,
    createHash('sha256').update(result.session.token).digest('hex'),
  );
  assert.equal(persisted.registration.email, 'ada@example.com');
  assert.equal(persisted.registration.passwordHash, 'argon2id-hash');
});

test('does not commit logical state when profile, weight, or session persistence fails', async () => {
  for (const failureMessage of [
    'Profile creation failed',
    'Weight entry creation failed',
    'Session creation failed',
  ]) {
    const committed: CreateCompleteRegistrationPersistenceInput[] = [];
    const repository: CompleteRegistrationRepository = {
      createRegistrationWithInitialSession: async (input) => {
        const pending = [...committed, input];
        void pending;
        throw new Error(failureMessage);
      },
    };
    const registerUserWithInitialSession = createRegisterUserWithInitialSessionService({
      repository,
      hashPassword: async () => 'argon2id-hash',
      randomBytes: () => Buffer.alloc(32, 0x61),
    });

    await assert.rejects(() => registerUserWithInitialSession(validInput), new RegExp(failureMessage));
    assert.deepEqual(committed, []);
  }
});

test('preserves EmailAlreadyExistsError from the transaction repository', async () => {
  const repository: CompleteRegistrationRepository = {
    createRegistrationWithInitialSession: async () => {
      throw new EmailAlreadyExistsError();
    },
  };
  const registerUserWithInitialSession = createRegisterUserWithInitialSessionService({
    repository,
    hashPassword: async () => 'argon2id-hash',
    randomBytes: () => Buffer.alloc(32, 0x61),
  });

  await assert.rejects(() => registerUserWithInitialSession(validInput), EmailAlreadyExistsError);
});
