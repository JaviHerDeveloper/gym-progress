import { db } from '../../../db/index.js';

import { DrizzleLoginRepository } from './login.repository.js';
import { createLoginUserService } from './login.service.js';

export const loginUser = createLoginUserService({
  repository: new DrizzleLoginRepository(db),
});
