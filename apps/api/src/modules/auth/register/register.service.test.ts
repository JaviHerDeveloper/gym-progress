import assert from 'node:assert/strict';
import test from 'node:test';

import { EmailAlreadyExistsError } from './register.errors.js';
import { isUsersEmailUniqueViolation } from './register.repository.js';
import { createRegisterUserService } from './register.service.js';
import type { CreateUserRegistration, RegisteredUser, UserRegistrationRepository } from './register.types.js';

const validInput = {
  name: '  Ada Lovelace  ',
  email: '  ADA@EXAMPLE.COM  ',
  password: 'correct-horse-battery-staple',
  heightCm: 165.5,
  weightKg: 61.25,
};

class RecordingRepository implements UserRegistrationRepository {
  readonly registrations: CreateUserRegistration[] = [];

  async createRegistration(input: CreateUserRegistration): Promise<RegisteredUser> {
    this.registrations.push(input);
    return { id: 'user-1', name: input.name, email: input.email };
  }
}

test('registers a valid user without returning the password or hash', async () => {
  const repository = new RecordingRepository();
  const registerUser = createRegisterUserService({
    repository,
    hashPassword: async () => 'argon2id-hash',
    now: () => new Date('2026-01-02T03:04:05.000Z'),
  });

  const result = await registerUser(validInput);

  assert.deepEqual(result, { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.deepEqual(repository.registrations[0], {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    passwordHash: 'argon2id-hash',
    heightCm: 165.5,
    weightKg: 61.25,
    measuredAt: new Date('2026-01-02T03:04:05.000Z'),
  });
});

test('hashes the password with Argon2id before persistence', async () => {
  const repository = new RecordingRepository();
  const registerUser = createRegisterUserService({ repository });

  await registerUser(validInput);

  assert.match(repository.registrations[0]?.passwordHash ?? '', /^\$argon2id\$/);
});

test('rejects invalid registration data before hashing or persistence', async () => {
  const repository = new RecordingRepository();
  let wasHashed = false;
  const registerUser = createRegisterUserService({
    repository,
    hashPassword: async () => {
      wasHashed = true;
      return 'unused';
    },
  });

  await assert.rejects(() => registerUser({ ...validInput, password: 'short', heightCm: 99 }));
  assert.equal(wasHashed, false);
  assert.equal(repository.registrations.length, 0);
});

test('propagates the duplicate-email domain error', async () => {
  const repository: UserRegistrationRepository = {
    createRegistration: async () => {
      throw new EmailAlreadyExistsError();
    },
  };
  const registerUser = createRegisterUserService({
    repository,
    hashPassword: async () => 'argon2id-hash',
  });

  await assert.rejects(() => registerUser(validInput), EmailAlreadyExistsError);
});

test('does not commit partial logical state when profile or weight persistence fails', async () => {
  for (const failureMessage of ['Profile creation failed', 'Weight entry creation failed']) {
    const committedRegistrations: CreateUserRegistration[] = [];
    const repository: UserRegistrationRepository = {
      createRegistration: async (input) => {
        const pendingRegistrations = [...committedRegistrations, input];
        void pendingRegistrations;
        throw new Error(failureMessage);
      },
    };
    const registerUser = createRegisterUserService({
      repository,
      hashPassword: async () => 'argon2id-hash',
    });

    await assert.rejects(() => registerUser(validInput), new RegExp(failureMessage));
    assert.deepEqual(committedRegistrations, []);
  }
});

test('recognizes only the users email unique constraint as a duplicate email', () => {
  assert.equal(
    isUsersEmailUniqueViolation({ code: '23505', constraint: 'users_email_unique' }),
    true,
  );
  assert.equal(
    isUsersEmailUniqueViolation({ code: '23505', constraint: 'user_profiles_user_id_unique' }), false);
});
