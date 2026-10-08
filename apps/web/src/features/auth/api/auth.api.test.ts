import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../services/api/api-error';
import { apiRequest } from '../../../services/api/api-client';
import { getCurrentUser, login, logout, register } from './auth.api';

vi.mock('../../../services/api/api-client', () => ({
  apiRequest: vi.fn(),
}));

const apiRequestMock = vi.mocked(apiRequest);
const user = { id: 'user-1', name: 'Ana', email: 'ana@example.com' };

describe('auth API', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('usa los contratos de registro, login, sesión y logout', async () => {
    apiRequestMock.mockResolvedValueOnce({ user });
    apiRequestMock.mockResolvedValueOnce({ user });
    apiRequestMock.mockResolvedValueOnce({ user });
    apiRequestMock.mockResolvedValueOnce(undefined);

    await expect(register({ name: 'Ana', email: user.email, password: 'password-123', heightCm: 170, weightKg: 65 })).resolves.toEqual(user);
    await expect(login({ email: user.email, password: 'password-123' })).resolves.toEqual(user);
    await expect(getCurrentUser()).resolves.toEqual(user);
    await expect(logout()).resolves.toBeUndefined();

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, '/api/auth/register', expect.objectContaining({ method: 'POST' }));
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, '/api/auth/login', expect.objectContaining({ method: 'POST' }));
    expect(apiRequestMock).toHaveBeenNthCalledWith(3, '/api/auth/me');
    expect(apiRequestMock).toHaveBeenNthCalledWith(4, '/api/auth/logout', { method: 'POST' });
  });

  it('rechaza respuestas exitosas con una forma insegura o inesperada', async () => {
    apiRequestMock.mockResolvedValue({ user: { id: 'user-1', passwordHash: 'never-public' } });

    await expect(getCurrentUser()).rejects.toBeInstanceOf(ApiError);
  });
});
