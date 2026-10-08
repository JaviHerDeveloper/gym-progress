import assert from 'node:assert/strict';
import test from 'node:test';

import { InvalidCredentialsError } from './login.errors.js';
import { createLoginUserService } from './login.service.js';
import type { LoginRepository, LoginUserRecord } from './login.types.js';
import {
  hashPasswordWithArgon2id,
  verifyPasswordWithArgon2id,
} from '../shared/password-hasher.js';

const user: LoginUserRecord = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  passwordHash: '$argon2id$stored-hash',
};

class RecordingLoginRepository implements LoginRepository {
  readonly searchedEmails: string[] = [];
  readonly sessions: Array<{ userId: string; tokenHash: string; expiresAt: Date }> = [];

  constructor(private readonly foundUser: LoginUserRecord | null = user) {}

  async findUserByEmail(email: string): Promise<LoginUserRecord | null> {
    this.searchedEmails.push(email);
    return this.foundUser;
  }

  async createSession(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    this.sessions.push(input);
  }
}

function preparedSession(token = 'session-token', tokenHash = 'a'.repeat(64)) {
  return {
    token,
    tokenHash,
    expiresAt: new Date('2026-04-02T03:04:05.000Z'),
  };
}

test('verifies passwords against the parameters encoded in an Argon2id hash', async () => {
  const password = '  password with spaces  ';
  const passwordHash = await hashPasswordWithArgon2id(password);

  assert.equal(await verifyPasswordWithArgon2id(password, passwordHash), true);
  assert.equal(await verifyPasswordWithArgon2id('different-password', passwordHash), false);
});

test('logs in with normalized email and returns only safe user and session data', async () => {
  const repository = new RecordingLoginRepository();
  const loginUser = createLoginUserService({
    repository,
    verifyPassword: async (password, passwordHash) => {
      assert.equal(password, 'correct-password');
      assert.equal(passwordHash, user.passwordHash);
      return true;
    },
    prepareSession: () => preparedSession(),
  });

  const result = await loginUser({
    email: '  ADA@EXAMPLE.COM  ',
    password: 'correct-password',
  });

  assert.deepEqual(repository.searchedEmails, ['ada@example.com']);
  assert.deepEqual(repository.sessions, [
    {
      userId: 'user-1',
      tokenHash: 'a'.repeat(64),
      expiresAt: new Date('2026-04-02T03:04:05.000Z'),
    },
  ]);
  assert.deepEqual(result, {
    user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
    session: { token: 'session-token', expiresAt: new Date('2026-04-02T03:04:05.000Z') },
  });
  assert.equal('password' in result, false);
  assert.equal('passwordHash' in result.user, false);
  assert.equal('tokenHash' in result.session, false);
});

test('does not transform the password before verification', async () => {
  const repository = new RecordingLoginRepository();
  const password = '  password with spaces  ';
  let verifiedPassword: string | undefined;
  const loginUser = createLoginUserService({
    repository,
    verifyPassword: async (receivedPassword) => {
      verifiedPassword = receivedPassword;
      return true;
    },
    prepareSession: () => preparedSession(),
  });

  await loginUser({ email: 'ada@example.com', password });

  assert.equal(verifiedPassword, password);
});

test('uses the same invalid credentials error when the email does not exist', async () => {
  const repository = new RecordingLoginRepository(null);
  const loginUser = createLoginUserService({
    repository,
    verifyPassword: async () => {
      throw new Error('Password verification must not be called.');
    },
  });

  await assert.rejects(() => loginUser({ email: 'missing@example.com', password: 'correct-password' }), (error) => {
    assert.ok(error instanceof InvalidCredentialsError);
    assert.equal(error.message, 'Invalid credentials.');
    return true;
  });
  assert.equal(repository.sessions.length, 0);
});

test('uses the same invalid credentials error when the password is incorrect', async () => {
  const repository = new RecordingLoginRepository();
  const loginUser = createLoginUserService({
    repository,
    verifyPassword: async () => false,
  });

  await assert.rejects(() => loginUser({ email: 'ada@example.com', password: 'wrong-password' }), (error) => {
    assert.ok(error instanceof InvalidCredentialsError);
    assert.equal(error.message, 'Invalid credentials.');
    return true;
  });
  assert.equal(repository.sessions.length, 0);
});

test('propagates unexpected Argon2 verification errors without translating them', async () => {
  const repository = new RecordingLoginRepository();
  const argonError = new Error('Stored password hash is corrupt.');
  const loginUser = createLoginUserService({
    repository,
    verifyPassword: async () => {
      throw argonError;
    },
  });

  await assert.rejects(() => loginUser({ email: 'ada@example.com', password: 'correct-password' }), argonError);
  assert.equal(repository.sessions.length, 0);
});

test('persists only the token hash when creating a new session', async () => {
  const repository = new RecordingLoginRepository();
  const loginUser = createLoginUserService({
    repository,
    verifyPassword: async () => true,
    prepareSession: () => preparedSession('original-session-token', 'b'.repeat(64)),
  });

  await loginUser({ email: 'ada@example.com', password: 'correct-password' });

  const persistedSession = repository.sessions[0];
  assert.ok(persistedSession);
  assert.deepEqual(Object.keys(persistedSession).sort(), ['expiresAt', 'tokenHash', 'userId']);
  assert.equal('token' in persistedSession, false);
  assert.notEqual(persistedSession.tokenHash, 'original-session-token');
});

test('allows multiple successful logins to create multiple sessions', async () => {
  const repository = new RecordingLoginRepository();
  let count = 0;
  const loginUser = createLoginUserService({
    repository,
    verifyPassword: async () => true,
    prepareSession: () => {
      count += 1;
      return preparedSession(`session-token-${count}`, `${count}`.repeat(64));
    },
  });

  await loginUser({ email: 'ada@example.com', password: 'correct-password' });
  await loginUser({ email: 'ada@example.com', password: 'correct-password' });

  assert.equal(repository.sessions.length, 2);
  assert.notEqual(repository.sessions[0]?.tokenHash, repository.sessions[1]?.tokenHash);
});

test('rejects invalid login input before querying persistence', async () => {
  const repository = new RecordingLoginRepository();
  const loginUser = createLoginUserService({ repository });

  await assert.rejects(() => loginUser({ email: 'not-an-email', password: 'short' }));
  await assert.rejects(() => loginUser({ email: 'ada@example.com', password: 'a'.repeat(129) }));
  assert.deepEqual(repository.searchedEmails, []);
  assert.deepEqual(repository.sessions, []);
});
