import { db } from '../../../db/index.js';

import { DrizzleSessionRepository } from './session.repository.js';
import { createValidateSessionService } from './validate-session.service.js';

export const validateSession = createValidateSessionService({
  repository: new DrizzleSessionRepository(db),
});
