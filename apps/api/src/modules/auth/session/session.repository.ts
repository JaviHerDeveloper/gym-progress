import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { authSessions } from '../../../db/schema/index.js';
import type * as schema from '../../../db/schema/index.js';

import type { CreateSessionPersistenceInput, SessionRepository } from './session.types.js';

type Database = NodePgDatabase<typeof schema>;

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private readonly database: Database) {}

  async createSession(input: CreateSessionPersistenceInput): Promise<void> {
    await this.database.insert(authSessions).values({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
  }
}
