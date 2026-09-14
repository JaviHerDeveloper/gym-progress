import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { bodyWeightEntries, userProfiles, users } from '../../../db/schema/index.js';
import type * as schema from '../../../db/schema/index.js';

import { EmailAlreadyExistsError } from './register.errors.js';
import type { CreateUserRegistration, RegisteredUser, UserRegistrationRepository } from './register.types.js';

type Database = NodePgDatabase<typeof schema>;
type RegistrationExecutor = Pick<Database, 'insert' | 'select'>;

type PostgresError = {
  code?: unknown;
  constraint?: unknown;
  cause?: unknown;
};

export function isUsersEmailUniqueViolation(error: unknown): boolean {
  const inspected = new Set<object>();
  let current: unknown = error;

  while (current && typeof current === 'object' && !inspected.has(current)) {
    inspected.add(current);
    const postgresError = current as PostgresError;

    if (postgresError.code === '23505' && postgresError.constraint === 'users_email_unique') {
      return true;
    }

    current = postgresError.cause;
  }

  return false;
}

export async function insertUserRegistration(
  executor: RegistrationExecutor,
  input: CreateUserRegistration,
): Promise<RegisteredUser> {
  const existingUser = await executor
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new EmailAlreadyExistsError();
  }

  const [createdUser] = await executor
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

  if (!createdUser) {
    throw new Error('User creation did not return a user.');
  }

  await executor.insert(userProfiles).values({
    userId: createdUser.id,
    heightCm: input.heightCm.toFixed(2),
  });

  await executor.insert(bodyWeightEntries).values({
    userId: createdUser.id,
    weightKg: input.weightKg.toFixed(2),
    measuredAt: input.measuredAt,
  });

  return createdUser;
}

export class DrizzleUserRegistrationRepository implements UserRegistrationRepository {
  constructor(private readonly database: Database) {}

  async createRegistration(input: CreateUserRegistration): Promise<RegisteredUser> {
    try {
      return await this.database.transaction((transaction) => insertUserRegistration(transaction, input));
    } catch (error) {
      if (isUsersEmailUniqueViolation(error)) {
        throw new EmailAlreadyExistsError();
      }

      throw error;
    }
  }
}
