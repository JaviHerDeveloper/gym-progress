import { createHash, randomBytes as nativeRandomBytes } from 'node:crypto';

export const SESSION_DURATION_DAYS = 90;
export const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export type PreparedSessionToken = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

type CreateSessionTokenDependencies = {
  now?: () => Date;
  randomBytes?: (size: number) => Buffer;
};

export function createSessionToken({
  now = () => new Date(),
  randomBytes = nativeRandomBytes,
}: CreateSessionTokenDependencies = {}): PreparedSessionToken {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(now().getTime() + SESSION_DURATION_MS);

  return { token, tokenHash, expiresAt };
}
