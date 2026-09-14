import { createHash, randomBytes as nativeRandomBytes } from 'node:crypto';

import type { CreatedSession, SessionRepository } from './session.types.js';

export const SESSION_DURATION_DAYS = 90;
export const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

type CreateSessionDependencies = {
  repository: SessionRepository;
  now?: () => Date;
  randomBytes?: (size: number) => Buffer;
};

export function createCreateSessionService({
  repository,
  now = () => new Date(),
  randomBytes = nativeRandomBytes,
}: CreateSessionDependencies) {
  return async function createSession(userId: string): Promise<CreatedSession> {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(now().getTime() + SESSION_DURATION_MS);

    await repository.createSession({ userId, tokenHash, expiresAt });

    return { token, expiresAt };
  };
}
