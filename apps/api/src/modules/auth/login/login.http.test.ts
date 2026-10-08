import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { createApp } from '../../../app-factory.js';
import type { RegisteredUserWithInitialSession } from '../complete-registration/complete-registration.types.js';
import type { RegisterUserInput } from '../register/register.schema.js';
import { InvalidCredentialsError } from './login.errors.js';
import { loginUserInputSchema } from './login.schema.js';
import type { LoginUserInput } from './login.schema.js';
import type { LoggedInUser } from './login.types.js';
import type { ValidatedSession } from '../session/session.types.js';

const corsOrigin = 'http://localhost:5173';
const validPayload = {
  email: 'ada@example.com',
  password: 'correct-horse-battery-staple',
};
const sessionExpiresAt = new Date('2030-01-02T03:04:05.000Z');

type LoginUseCase = (input: LoginUserInput) => Promise<LoggedInUser>;

async function withServer(
  loginUser: LoginUseCase,
  isProduction: boolean,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const registerUserWithInitialSession = async (
    _input: RegisterUserInput,
  ): Promise<RegisteredUserWithInitialSession> => {
    throw new Error('Registration is not used by these tests.');
  };
  const validateSession = async (_token: string): Promise<ValidatedSession | null> => null;
  const server = createServer(
    createApp({
      registerUserWithInitialSession,
      loginUser,
      validateSession,
      corsOrigin,
      isProduction,
    }),
  );

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Test server did not expose a TCP address.');
  }

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

function successfulLogin(): LoggedInUser {
  return {
    user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
    session: { token: 'session-token-that-must-not-be-in-json', expiresAt: sessionExpiresAt },
  };
}

test('logs in with a safe body and development session cookie', async () => {
  const receivedInputs: LoginUserInput[] = [];
  await withServer(async (input) => {
    receivedInputs.push(input);
    return successfulLogin();
  }, false, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validPayload),
    });
    const body = await response.json();
    const cookie = response.headers.get('set-cookie');

    assert.equal(response.status, 200);
    assert.deepEqual(receivedInputs, [validPayload]);
    assert.deepEqual(body, { user: successfulLogin().user });
    assert.doesNotMatch(JSON.stringify(body), /token|hash|password|expiresAt/i);
    assert.ok(cookie);
    assert.match(cookie, /^gp_session=/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /Path=\//i);
    assert.doesNotMatch(cookie, /Secure/i);
    assert.doesNotMatch(cookie, /Domain=/i);
    const expiresMatch = /Expires=([^;]+)/i.exec(cookie);
    assert.ok(expiresMatch?.[1]);
    assert.equal(Date.parse(expiresMatch[1]), sessionExpiresAt.getTime());
  });
});

test('sets the session cookie as Secure only in production', async () => {
  await withServer(async () => successfulLogin(), true, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie') ?? '', /Secure/i);
  });
});

test('returns 400 without a cookie for an invalid payload', async () => {
  const loginUser: LoginUseCase = async (input) => {
    loginUserInputSchema.parse(input);
    throw new Error('The test input should have failed validation.');
  };

  await withServer(loginUser, false, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validPayload, password: 'short' }),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: { code: 'VALIDATION_ERROR', message: 'Los datos enviados no son válidos.' },
    });
    assert.equal(response.headers.get('set-cookie'), null);
  });
});

test('returns 401 without a cookie for invalid credentials', async () => {
  await withServer(
    async () => {
      throw new InvalidCredentialsError();
    },
    false,
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const body = await response.json();

      assert.equal(response.status, 401);
      assert.deepEqual(body, {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Correo o contraseña incorrectos.',
        },
      });
      assert.doesNotMatch(JSON.stringify(body), /token|hash|password/i);
      assert.equal(response.headers.get('set-cookie'), null);
    },
  );
});

test('returns 500 without internal details or a cookie for unexpected errors', async () => {
  await withServer(
    async () => {
      throw new Error('database password and token details');
    },
    false,
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const body = await response.json();

      assert.equal(response.status, 500);
      assert.deepEqual(body, {
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Ocurrió un error inesperado.' },
      });
      assert.doesNotMatch(JSON.stringify(body), /database password|token details/i);
      assert.equal(response.headers.get('set-cookie'), null);
    },
  );
});
