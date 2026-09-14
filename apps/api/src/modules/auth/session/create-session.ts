import { db } from '../../../db/index.js';

import { DrizzleSessionRepository } from './session.repository.js';
import { createCreateSessionService } from './session.service.js';

export const createSession = createCreateSessionService({
  repository: new DrizzleSessionRepository(db),
});
