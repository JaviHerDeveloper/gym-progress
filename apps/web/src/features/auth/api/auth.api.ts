import { ApiError } from '../../../services/api/api-error';
import { apiRequest } from '../../../services/api/api-client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
  heightCm: number;
  weightKg: number;
};

type UserResponse = {
  user: AuthUser;
};

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return typeof user.id === 'string' && typeof user.name === 'string' && typeof user.email === 'string';
}

function getUser(response: unknown): AuthUser {
  if (typeof response === 'object' && response !== null && isAuthUser((response as UserResponse).user)) {
    return (response as UserResponse).user;
  }

  throw new ApiError(200, 'UNEXPECTED_RESPONSE', 'No pudimos procesar la respuesta del servidor.');
}

export async function login(input: LoginInput): Promise<AuthUser> {
  return getUser(await apiRequest<UserResponse>('/api/auth/login', { method: 'POST', body: input }));
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  return getUser(await apiRequest<UserResponse>('/api/auth/register', { method: 'POST', body: input }));
}

export async function getCurrentUser(): Promise<AuthUser> {
  return getUser(await apiRequest<UserResponse>('/api/auth/me'));
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/api/auth/logout', { method: 'POST' });
}
