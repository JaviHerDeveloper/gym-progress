import { Router } from 'express';

import { createRegisterController } from './register.controller.js';
import type { RegisterUserInput } from './register.schema.js';
import type { RegisteredUserWithInitialSession } from '../complete-registration/complete-registration.types.js';

type CreateRegisterRouterDependencies = {
  registerUserWithInitialSession: (
    input: RegisterUserInput,
  ) => Promise<RegisteredUserWithInitialSession>;
  isProduction: boolean;
};

export function createRegisterRouter(dependencies: CreateRegisterRouterDependencies): Router {
  const router = Router();

  router.post('/register', createRegisterController(dependencies));

  return router;
}
