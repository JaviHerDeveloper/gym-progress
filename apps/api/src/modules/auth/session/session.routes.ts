import { Router } from 'express';

import { createCurrentUserController } from './session.controller.js';
import type { ValidatedSession } from './session.types.js';

type CreateSessionRouterDependencies = {
  validateSession: (token: string) => Promise<ValidatedSession | null>;
  isProduction: boolean;
};

export function createSessionRouter(dependencies: CreateSessionRouterDependencies): Router {
  const router = Router();

  router.get('/me', createCurrentUserController(dependencies));

  return router;
}
