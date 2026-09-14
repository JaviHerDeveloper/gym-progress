import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { setSessionCookie } from '../http/session-cookie.js';
import { EmailAlreadyExistsError } from './register.errors.js';
import type { RegisterUserInput } from './register.schema.js';
import type { RegisteredUserWithInitialSession } from '../complete-registration/complete-registration.types.js';

type RegisterUserWithInitialSession = (
  input: RegisterUserInput,
) => Promise<RegisteredUserWithInitialSession>;

type CreateRegisterControllerDependencies = {
  registerUserWithInitialSession: RegisterUserWithInitialSession;
  isProduction: boolean;
};

export function createRegisterController({
  registerUserWithInitialSession,
  isProduction,
}: CreateRegisterControllerDependencies) {
  return async function registerController(request: Request, response: Response): Promise<void> {
    try {
      const { user, session } = await registerUserWithInitialSession(request.body);

      setSessionCookie(response, {
        token: session.token,
        expiresAt: session.expiresAt,
        isProduction,
      });

      response.status(201).json({ user });
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

      if (error instanceof EmailAlreadyExistsError) {
        response.status(409).json({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Ya existe una cuenta con este correo.',
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
