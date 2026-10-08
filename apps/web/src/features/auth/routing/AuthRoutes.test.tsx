import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

const authState = vi.hoisted(() => ({
  status: 'unauthenticated' as 'loading' | 'authenticated' | 'unauthenticated' | 'error',
  refreshSession: vi.fn(),
}));

vi.mock('../context/useAuth', () => ({
  useAuth: () => authState,
}));

function renderRoutes(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<p>login</p>} />
          <Route path="/register" element={<p>register</p>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>app</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('guards de autenticación', () => {
  beforeEach(() => {
    authState.status = 'unauthenticated';
  });

  it('permite rutas públicas a visitantes y redirige visitantes fuera de /app', () => {
    renderRoutes('/login');
    expect(screen.getByText('login')).toBeInTheDocument();

    renderRoutes('/app');
    expect(screen.getAllByText('login')).toHaveLength(2);
  });

  it('redirige usuarios autenticados desde rutas públicas y permite /app', () => {
    authState.status = 'authenticated';
    renderRoutes('/login');
    expect(screen.getByText('app')).toBeInTheDocument();

    renderRoutes('/app');
    expect(screen.getAllByText('app')).toHaveLength(2);
  });
});
