import { Router } from 'express';

import { createLoginController } from './login.controller.js';
import type { LoginUserInput } from './login.schema.js';
import type { LoggedInUser } from './login.types.js';

type CreateLoginRouterDependencies = {
  loginUser: (input: LoginUserInput) => Promise<LoggedInUser>;
  isProduction: boolean;
};

export function createLoginRouter(dependencies: CreateLoginRouterDependencies): Router {
  const router = Router();

  router.post('/login', createLoginController(dependencies));

  return router;
}
