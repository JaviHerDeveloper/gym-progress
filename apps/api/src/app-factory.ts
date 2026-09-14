import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';

import { createRegisterRouter } from './modules/auth/register/register.routes.js';
import type { RegisterUserInput } from './modules/auth/register/register.schema.js';
import type { RegisteredUserWithInitialSession } from './modules/auth/complete-registration/complete-registration.types.js';
import { createSessionRouter } from './modules/auth/session/session.routes.js';
import type { ValidatedSession } from './modules/auth/session/session.types.js';

type AppDependencies = {
  registerUserWithInitialSession: (
    input: RegisterUserInput,
  ) => Promise<RegisteredUserWithInitialSession>;
  validateSession: (token: string) => Promise<ValidatedSession | null>;
  corsOrigin: string;
  isProduction: boolean;
};

const jsonErrorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (error instanceof SyntaxError && (error as { status?: unknown }).status === 400) {
    response.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'El JSON enviado no es válido.',
      },
    });
    return;
  }

  if (response.headersSent) {
    next(error);
    return;
  }

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error inesperado.',
    },
  });
};

export function createApp({
  registerUserWithInitialSession,
  validateSession,
  corsOrigin,
  isProduction,
}: AppDependencies) {
  const app = express();

  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(
    '/api/auth',
    createRegisterRouter({
      registerUserWithInitialSession,
      isProduction,
    }),
  );
  app.use('/api/auth', createSessionRouter({ validateSession, isProduction }));
  app.use(jsonErrorHandler);

  return app;
}
