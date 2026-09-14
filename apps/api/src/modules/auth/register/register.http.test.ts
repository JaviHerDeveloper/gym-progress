import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { createApp } from '../../../app-factory.js';
import { EmailAlreadyExistsError } from './register.errors.js';
import { registerUserInputSchema } from './register.schema.js';
import type { RegisterUserInput } from './register.schema.js';
import type { RegisteredUserWithInitialSession } from '../complete-registration/complete-registration.types.js';

const corsOrigin = 'http://localhost:5173';
const validPayload = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'correct-horse-battery-staple',
  heightCm: 165.5,
  weightKg: 61.25,
};
const sessionExpiresAt = new Date('2030-01-02T03:04:05.000Z');

type RegisterUseCase = (
  input: RegisterUserInput,
) => Promise<RegisteredUserWithInitialSession>;

async function withServer(
  registerUserWithInitialSession: RegisterUseCase,
  isProduction: boolean,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = createServer(
    createApp({
      registerUserWithInitialSession,
      validateSession: async () => null,
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

function successfulRegistration(): RegisteredUserWithInitialSession {
  return {
    user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
    session: { token: 'session-token-that-must-not-be-in-json', expiresAt: sessionExpiresAt },
  };
}

test('registers successfully with a safe body and development session cookie', async () => {
  await withServer(async () => successfulRegistration(), false, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: corsOrigin },
      body: JSON.stringify(validPayload),
    });
    const body = await response.json();
    const cookie = response.headers.get('set-cookie');

    assert.equal(response.status, 201);
    assert.deepEqual(body, { user: successfulRegistration().user });
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
    assert.equal(response.headers.get('access-control-allow-origin'), corsOrigin);
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
  });
});

test('sets the session cookie as Secure only in production', async () => {
  await withServer(async () => successfulRegistration(), true, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    assert.equal(response.status, 201);
    assert.match(response.headers.get('set-cookie') ?? '', /Secure/i);
  });
});

test('returns 400 without a cookie when validation fails', async () => {
  const registerUserWithInitialSession: RegisterUseCase = async (input) => {
    registerUserInputSchema.parse(input);
    throw new Error('The test input should have failed validation.');
  };

  await withServer(registerUserWithInitialSession, false, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
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

test('returns 400 without a cookie for malformed JSON', async () => {
  await withServer(async () => successfulRegistration(), false, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"name":',
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: { code: 'INVALID_JSON', message: 'El JSON enviado no es válido.' },
    });
    assert.equal(response.headers.get('set-cookie'), null);
  });
});

test('returns 409 without a cookie for an existing email', async () => {
  await withServer(
    async () => {
      throw new EmailAlreadyExistsError();
    },
    false,
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      });

      assert.equal(response.status, 409);
      assert.deepEqual(await response.json(), {
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Ya existe una cuenta con este correo.' },
      });
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
      const response = await fetch(`${baseUrl}/api/auth/register`, {
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

test('CORS exposes only the configured origin and enables credentials', async () => {
  await withServer(async () => successfulRegistration(), false, async (baseUrl) => {
    const configuredOriginResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'OPTIONS',
      headers: { origin: corsOrigin, 'access-control-request-method': 'POST' },
    });
    const unconfiguredOrigin = 'http://localhost:4173';
    const unconfiguredOriginResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'OPTIONS',
      headers: { origin: unconfiguredOrigin, 'access-control-request-method': 'POST' },
    });

    assert.equal(configuredOriginResponse.headers.get('access-control-allow-origin'), corsOrigin);
    assert.equal(configuredOriginResponse.headers.get('access-control-allow-credentials'), 'true');
    assert.notEqual(
      unconfiguredOriginResponse.headers.get('access-control-allow-origin'),
      unconfiguredOrigin,
    );
  });
});
