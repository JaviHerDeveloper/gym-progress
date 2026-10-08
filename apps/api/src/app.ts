import { createApp } from './app-factory.js';
import { registerUserWithInitialSession } from './modules/auth/complete-registration/register-user-with-initial-session.js';
import { loginUser } from './modules/auth/login/login-user.js';
import { validateSession } from './modules/auth/session/validate-session.js';

const corsOrigin = process.env.CORS_ORIGIN;

if (!corsOrigin) {
  throw new Error('CORS_ORIGIN must be configured.');
}

export const app = createApp({
  registerUserWithInitialSession,
  loginUser,
  validateSession,
  corsOrigin,
  isProduction: process.env.NODE_ENV === 'production',
});
