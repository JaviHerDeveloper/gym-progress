import { parse } from 'cookie';
import type { Request, Response } from 'express';

import { clearSessionCookie, SESSION_COOKIE_NAME } from '../http/session-cookie.js';
import type { ValidatedSession } from './session.types.js';

type ValidateSession = (token: string) => Promise<ValidatedSession | null>;

type CreateCurrentUserControllerDependencies = {
  validateSession: ValidateSession;
  isProduction: boolean;
};

const unauthenticatedResponse = {
  error: {
    code: 'UNAUTHENTICATED',
    message: 'No hay una sesión válida.',
  },
};

export function createCurrentUserController({
  validateSession,
  isProduction,
}: CreateCurrentUserControllerDependencies) {
  return async function currentUserController(request: Request, response: Response): Promise<void> {
    const token = parse(request.headers.cookie ?? '')[SESSION_COOKIE_NAME];

    if (token === undefined) {
      response.status(401).json(unauthenticatedResponse);
      return;
    }

    try {
      const session = await validateSession(token);

      if (!session) {
        clearSessionCookie(response, isProduction);
        response.status(401).json(unauthenticatedResponse);
        return;
      }

      response.status(200).json({ user: session.user });
    } catch {
      response.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ocurrió un error inesperado.',
        },
      });
    }
  };
}
