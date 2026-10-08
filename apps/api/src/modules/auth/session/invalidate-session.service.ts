import { hashSessionToken } from './session-token.js';
import type { SessionInvalidationRepository } from './session.types.js';

type InvalidateSessionDependencies = {
  repository: SessionInvalidationRepository;
};

export function createInvalidateSessionService({ repository }: InvalidateSessionDependencies) {
  return async function invalidateSession(token: string): Promise<void> {
    if (token.trim().length === 0) {
      return;
    }

    await repository.deleteSessionByTokenHash(hashSessionToken(token));
  };
}
