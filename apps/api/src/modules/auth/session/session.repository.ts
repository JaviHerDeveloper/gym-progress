import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { authSessions, users } from '../../../db/schema/index.js';
import type * as schema from '../../../db/schema/index.js';

import type {
  CreateSessionPersistenceInput,
  SessionInvalidationRepository,
  SessionRepository,
  SessionValidationRepository,
  ValidatedSession,
} from './session.types.js';

type Database = NodePgDatabase<typeof schema>;
type SessionExecutor = Pick<Database, 'insert'>;
type SessionDeletionExecutor = Pick<Database, 'delete'>;

export async function insertAuthSession(
  executor: SessionExecutor,
  input: CreateSessionPersistenceInput,
): Promise<void> {
  await executor.insert(authSessions).values({
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
  });
}

export async function deleteAuthSessionByTokenHash(
  executor: SessionDeletionExecutor,
  tokenHash: string,
): Promise<void> {
  await executor.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
}

export class DrizzleSessionRepository
  implements SessionRepository, SessionValidationRepository, SessionInvalidationRepository
{
  constructor(private readonly database: Database) {}

  async createSession(input: CreateSessionPersistenceInput): Promise<void> {
    await insertAuthSession(this.database, input);
  }

  async findSessionByTokenHash(tokenHash: string): Promise<ValidatedSession | null> {
    const [record] = await this.database
      .select({
        session: {
          id: authSessions.id,
          expiresAt: authSessions.expiresAt,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(authSessions)
      .innerJoin(users, eq(authSessions.userId, users.id))
      .where(eq(authSessions.tokenHash, tokenHash))
      .limit(1);

    return record ?? null;
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    await deleteAuthSessionByTokenHash(this.database, tokenHash);
  }
}
