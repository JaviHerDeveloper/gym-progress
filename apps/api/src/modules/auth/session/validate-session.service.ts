import { hashSessionToken } from './session-token.js';
import type { SessionValidationRepository, ValidatedSession } from './session.types.js';

type ValidateSessionDependencies = {
  repository: SessionValidationRepository;
  now?: () => Date;
};

export function createValidateSessionService({
  repository,
  now = () => new Date(),
}: ValidateSessionDependencies) {
  return async function validateSession(token: string): Promise<ValidatedSession | null> {
    if (token.trim().length === 0) {
      return null;
    }

    const currentTime = now();
    const session = await repository.findSessionByTokenHash(hashSessionToken(token));

    if (!session || session.session.expiresAt.getTime() <= currentTime.getTime()) {
      return null;
    }

    return session;
  };
}
