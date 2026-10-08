import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from './api-error';
import { apiRequest } from './api-client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiRequest', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('envía JSON y cookies al API configurado', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: { id: 'user-1' } }, 201));

    await expect(apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'ana@example.com', password: 'password-123' },
    })).resolves.toEqual({ user: { id: 'user-1' } });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ana@example.com', password: 'password-123' }),
      }),
    );
  });

  it('soporta respuestas 204 sin intentar parsear JSON', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiRequest<void>('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('traduce errores públicos del API sin detalles internos', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      error: { code: 'INVALID_CREDENTIALS', message: 'Correo o contraseña incorrectos.' },
    }, 401));

    await expect(apiRequest('/api/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Correo o contraseña incorrectos.',
    } satisfies Partial<ApiError>);
  });

  it('convierte fallos de red en un error público seguro', async () => {
    fetchMock.mockRejectedValue(new Error('connection refused'));

    await expect(apiRequest('/api/auth/me')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'No pudimos comunicarnos con el servidor.',
    } satisfies Partial<ApiError>);
  });
});
