import { db } from '../../../db/index.js';

import { DrizzleCompleteRegistrationRepository } from './complete-registration.repository.js';
import { createRegisterUserWithInitialSessionService } from './complete-registration.service.js';

export const registerUserWithInitialSession = createRegisterUserWithInitialSessionService({
  repository: new DrizzleCompleteRegistrationRepository(db),
});
