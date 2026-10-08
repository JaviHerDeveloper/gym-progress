import { createContext } from 'react';

import type { AuthUser, LoginInput, RegisterInput } from '../api/auth.api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  errorMessage: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
