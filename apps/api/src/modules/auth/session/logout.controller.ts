import { parse } from 'cookie';
import type { Request, Response } from 'express';

import { clearSessionCookie, SESSION_COOKIE_NAME } from '../http/session-cookie.js';

type InvalidateSession = (token: string) => Promise<void>;

type CreateLogoutControllerDependencies = {
  invalidateSession: InvalidateSession;
  isProduction: boolean;
};

export function createLogoutController({
  invalidateSession,
  isProduction,
}: CreateLogoutControllerDependencies) {
  return async function logoutController(request: Request, response: Response): Promise<void> {
    const token = parse(request.headers.cookie ?? '')[SESSION_COOKIE_NAME];

    try {
      if (token !== undefined) {
        await invalidateSession(token);
        clearSessionCookie(response, isProduction);
      }

      response.status(204).send();
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
