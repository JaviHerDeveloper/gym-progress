import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { createApp } from '../../../app-factory.js';
import type { RegisterUserInput } from '../register/register.schema.js';
import type { RegisteredUserWithInitialSession } from '../complete-registration/complete-registration.types.js';
import type { ValidatedSession } from './session.types.js';

const corsOrigin = 'http://localhost:5173';
const validSession: ValidatedSession = {
  user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
  session: { id: 'session-1', expiresAt: new Date('2030-01-02T03:04:05.000Z') },
};

type ValidateSession = (token: string) => Promise<ValidatedSession | null>;

async function withServer(
  validateSession: ValidateSession,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const registerUserWithInitialSession = async (
    _input: RegisterUserInput,
  ): Promise<RegisteredUserWithInitialSession> => {
    throw new Error('Registration is not used by these tests.');
  };
  const server = createServer(
    createApp({
      registerUserWithInitialSession,
      validateSession,
      corsOrigin,
      isProduction: false,
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

function assertClearedSessionCookie(cookie: string | null): void {
  assert.ok(cookie);
  assert.match(cookie, /^gp_session=/);
  assert.match(cookie, /Expires=Thu, 01 Jan 1970/i);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Path=\//i);
  assert.doesNotMatch(cookie, /Domain=/i);
}

test('returns the safe current user and passes the exact cookie token to validation', async () => {
  const receivedTokens: string[] = [];
  await withServer(async (token) => {
    receivedTokens.push(token);
    return validSession;
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: 'gp_session=exact-session-token' },
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { user: validSession.user });
    assert.doesNotMatch(JSON.stringify(body), /token|hash|password|expiresAt/i);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.deepEqual(receivedTokens, ['exact-session-token']);
  });
});

test('returns 401 without Set-Cookie when gp_session is absent', async () => {
  let validationCalls = 0;
  await withServer(async () => {
    validationCalls += 1;
    return null;
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/me`);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      error: { code: 'UNAUTHENTICATED', message: 'No hay una sesión válida.' },
    });
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(validationCalls, 0);
  });
});

test('clears an empty gp_session cookie after validation returns null', async () => {
  const receivedTokens: string[] = [];
  await withServer(async (token) => {
    receivedTokens.push(token);
    return null;
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: 'gp_session=' },
    });

    assert.equal(response.status, 401);
    assertClearedSessionCookie(response.headers.get('set-cookie'));
    assert.deepEqual(receivedTokens, ['']);
  });
});

test('clears the cookie for an unknown token', async () => {
  await withServer(async () => null, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: 'gp_session=unknown-token' },
    });

    assert.equal(response.status, 401);
    assertClearedSessionCookie(response.headers.get('set-cookie'));
  });
});

test('clears the cookie for an expired or invalidated session', async () => {
  await withServer(async () => null, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: 'gp_session=expired-token' },
    });

    assert.equal(response.status, 401);
    assertClearedSessionCookie(response.headers.get('set-cookie'));
  });
});

test('returns a safe 500 without clearing the cookie when validation fails unexpectedly', async () => {
  await withServer(async () => {
    throw new Error('database credentials should remain private');
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: 'gp_session=possibly-valid-token' },
    });
    const body = await response.json();

    assert.equal(response.status, 500);
    assert.deepEqual(body, {
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Ocurrió un error inesperado.' },
    });
    assert.doesNotMatch(JSON.stringify(body), /credentials|token|password/i);
    assert.equal(response.headers.get('set-cookie'), null);
  });
});
