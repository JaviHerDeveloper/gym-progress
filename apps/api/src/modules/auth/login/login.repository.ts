import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { users } from '../../../db/schema/index.js';
import type * as schema from '../../../db/schema/index.js';
import { insertAuthSession } from '../session/session.repository.js';
import type { CreateSessionPersistenceInput } from '../session/session.types.js';

import type { LoginRepository, LoginUserRecord } from './login.types.js';

type Database = NodePgDatabase<typeof schema>;

export class DrizzleLoginRepository implements LoginRepository {
  constructor(private readonly database: Database) {}

  async findUserByEmail(email: string): Promise<LoginUserRecord | null> {
    const [user] = await this.database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async createSession(input: CreateSessionPersistenceInput): Promise<void> {
    await insertAuthSession(this.database, input);
  }
}
