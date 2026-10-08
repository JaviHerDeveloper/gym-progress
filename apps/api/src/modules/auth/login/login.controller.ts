import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { setSessionCookie } from '../http/session-cookie.js';

import { InvalidCredentialsError } from './login.errors.js';
import type { LoginUserInput } from './login.schema.js';
import type { LoggedInUser } from './login.types.js';

type LoginUser = (input: LoginUserInput) => Promise<LoggedInUser>;

type CreateLoginControllerDependencies = {
  loginUser: LoginUser;
  isProduction: boolean;
};

export function createLoginController({ loginUser, isProduction }: CreateLoginControllerDependencies) {
  return async function loginController(request: Request, response: Response): Promise<void> {
    try {
      const { user, session } = await loginUser(request.body);

      setSessionCookie(response, {
        token: session.token,
        expiresAt: session.expiresAt,
        isProduction,
      });

      response.status(200).json({ user });
    } catch (error) {
      if (error instanceof ZodError) {
        response.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Los datos enviados no son válidos.',
          },
        });
        return;
      }

      if (error instanceof InvalidCredentialsError) {
        response.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Correo o contraseña incorrectos.',
          },
        });
        return;
      }

      response.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ocurrió un error inesperado.',
        },
      });
    }
  };
}
