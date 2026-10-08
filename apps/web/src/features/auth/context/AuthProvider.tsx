import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import { ApiError } from '../../../services/api/api-error';
import * as authApi from '../api/auth.api';
import { AuthContext, type AuthStatus } from './AuthContext';

type AuthState = {
  user: authApi.AuthUser | null;
  status: AuthStatus;
  errorMessage: string | null;
};

const initialState: AuthState = {
  user: null,
  status: 'loading',
  errorMessage: null,
};

const sessionCheckErrorMessage = 'No pudimos comprobar tu sesión.';

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(initialState);
  const hasBootstrapped = useRef(false);
  const requestVersion = useRef(0);

  const refreshSession = useCallback(async () => {
    const version = ++requestVersion.current;
    setState((current) => ({ ...current, status: 'loading', errorMessage: null }));

    try {
      const user = await authApi.getCurrentUser();

      if (version === requestVersion.current) {
        setState({ user, status: 'authenticated', errorMessage: null });
      }
    } catch (error) {
      if (version !== requestVersion.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        setState({ user: null, status: 'unauthenticated', errorMessage: null });
        return;
      }

      setState((current) => ({
        user: current.user,
        status: 'error',
        errorMessage: sessionCheckErrorMessage,
      }));
    }
  }, []);

  useEffect(() => {
    if (hasBootstrapped.current) {
      return;
    }

    hasBootstrapped.current = true;
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (input: authApi.LoginInput) => {
    const user = await authApi.login(input);
    setState({ user, status: 'authenticated', errorMessage: null });
  }, []);

  const register = useCallback(async (input: authApi.RegisterInput) => {
    const user = await authApi.register(input);
    setState({ user, status: 'authenticated', errorMessage: null });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({ user: null, status: 'unauthenticated', errorMessage: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}
