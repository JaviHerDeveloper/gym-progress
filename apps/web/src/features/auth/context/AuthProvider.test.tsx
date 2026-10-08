import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ApiError } from '../../../services/api/api-error';
import * as authApi from '../api/auth.api';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

vi.mock('../api/auth.api', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

const authApiMock = vi.mocked(authApi);

function AuthStateProbe() {
  const { status, user, errorMessage, refreshSession, login, logout } = useAuth();

  return (
    <>
      <p>{status}</p>
      <p>{user?.email ?? 'no-user'}</p>
      <p>{errorMessage ?? 'no-error'}</p>
      <button type="button" onClick={() => void refreshSession()}>retry</button>
      <button type="button" onClick={() => void login({ email: 'ana@example.com', password: 'password-123' })}>login</button>
      <button type="button" onClick={() => void logout()}>logout</button>
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restaura una sesión válida al iniciar', async () => {
    authApiMock.getCurrentUser.mockResolvedValue({ id: 'user-1', name: 'Ana', email: 'ana@example.com' });

    render(<AuthProvider><AuthStateProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
  });

  it('considera 401 como estado no autenticado y no como error de infraestructura', async () => {
    authApiMock.getCurrentUser.mockRejectedValue(new ApiError(401, 'UNAUTHENTICATED', 'No hay una sesión válida.'));

    render(<AuthProvider><AuthStateProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument());
    expect(screen.getByText('no-error')).toBeInTheDocument();
  });

  it('expone un estado recuperable cuando falla la comprobación de sesión', async () => {
    authApiMock.getCurrentUser
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'No pudimos comunicarnos con el servidor.'))
      .mockResolvedValueOnce({ id: 'user-1', name: 'Ana', email: 'ana@example.com' });

    const user = userEvent.setup();
    render(<AuthProvider><AuthStateProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument());
    expect(screen.getByText('No pudimos comprobar tu sesión.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'retry' }));
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
  });

  it('actualiza el estado con login y logout exitosos', async () => {
    authApiMock.getCurrentUser.mockRejectedValue(new ApiError(401, 'UNAUTHENTICATED', 'No hay una sesión válida.'));
    authApiMock.login.mockResolvedValue({ id: 'user-1', name: 'Ana', email: 'ana@example.com' });
    authApiMock.logout.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AuthProvider><AuthStateProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'login' }));
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument());
  });
});
