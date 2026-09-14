import { db } from '../../../db/index.js';

import { DrizzleUserRegistrationRepository } from './register.repository.js';
import { createRegisterUserService } from './register.service.js';

export const registerUser = createRegisterUserService({
  repository: new DrizzleUserRegistrationRepository(db),
});
