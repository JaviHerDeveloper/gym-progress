import { createApp } from './app-factory.js';
import { registerUserWithInitialSession } from './modules/auth/complete-registration/register-user-with-initial-session.js';

const corsOrigin = process.env.CORS_ORIGIN;

if (!corsOrigin) {
  throw new Error('CORS_ORIGIN must be configured.');
}

export const app = createApp({
  registerUserWithInitialSession,
  corsOrigin,
  isProduction: process.env.NODE_ENV === 'production',
});
