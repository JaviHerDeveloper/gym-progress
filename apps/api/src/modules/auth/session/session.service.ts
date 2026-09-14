import { createSessionToken } from './session-token.js';
import type { CreatedSession, SessionRepository } from './session.types.js';

type CreateSessionDependencies = {
  repository: SessionRepository;
  now?: () => Date;
  randomBytes?: (size: number) => Buffer;
};

export function createCreateSessionService({
  repository,
  now = () => new Date(),
  randomBytes,
}: CreateSessionDependencies) {
  return async function createSession(userId: string): Promise<CreatedSession> {
    const { token, tokenHash, expiresAt } = createSessionToken({ now, randomBytes });

    await repository.createSession({ userId, tokenHash, expiresAt });

    return { token, expiresAt };
  };
}
