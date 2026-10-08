import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppPage } from './AppPage';

const authMocks = vi.hoisted(() => ({
  logout: vi.fn(),
  user: { id: 'user-1', name: 'Ana', email: 'ana@example.com' } as { id: string; name: string; email: string } | null,
}));

vi.mock('../auth/context/useAuth', () => ({
  useAuth: () => ({ user: authMocks.user, logout: authMocks.logout }),
}));

describe('AppPage', () => {
  beforeEach(() => {
    authMocks.logout.mockReset();
    authMocks.user = { id: 'user-1', name: 'Ana', email: 'ana@example.com' };
  });

  it('cierra sesión una vez y refleja actividad mientras espera', async () => {
    let resolveLogout: (() => void) | undefined;
    authMocks.logout.mockReturnValue(new Promise<void>((resolve) => { resolveLogout = resolve; }));
    const user = userEvent.setup();
    render(<AppPage />);

    await user.click(screen.getByRole('button', { name: 'CERRAR SESIÓN' }));
    expect(authMocks.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'CERRANDO SESIÓN...' })).toBeDisabled();

    resolveLogout?.();
  });

  it('conserva la pantalla autenticada y muestra un error seguro si logout falla', async () => {
    authMocks.logout.mockRejectedValue(new Error('database detail'));
    const user = userEvent.setup();
    render(<AppPage />);

    await user.click(screen.getByRole('button', { name: 'CERRAR SESIÓN' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cerrar sesión. Inténtalo de nuevo.');
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
  });
});
