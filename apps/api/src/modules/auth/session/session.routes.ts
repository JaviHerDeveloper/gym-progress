import { Router } from 'express';

import { createCurrentUserController } from './session.controller.js';
import { createLogoutController } from './logout.controller.js';
import type { ValidatedSession } from './session.types.js';

type CreateSessionRouterDependencies = {
  validateSession: (token: string) => Promise<ValidatedSession | null>;
  invalidateSession: (token: string) => Promise<void>;
  isProduction: boolean;
};

export function createSessionRouter(dependencies: CreateSessionRouterDependencies): Router {
  const router = Router();

  router.get('/me', createCurrentUserController(dependencies));
  router.post('/logout', createLogoutController(dependencies));

  return router;
}
