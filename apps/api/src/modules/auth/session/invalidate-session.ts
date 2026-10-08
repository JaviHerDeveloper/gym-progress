import { db } from '../../../db/index.js';

import { DrizzleSessionRepository } from './session.repository.js';
import { createInvalidateSessionService } from './invalidate-session.service.js';

export const invalidateSession = createInvalidateSessionService({
  repository: new DrizzleSessionRepository(db),
});
