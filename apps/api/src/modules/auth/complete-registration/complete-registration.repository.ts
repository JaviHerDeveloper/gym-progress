import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from '../../../db/schema/index.js';
import { EmailAlreadyExistsError } from '../register/register.errors.js';
import { insertUserRegistration, isUsersEmailUniqueViolation } from '../register/register.repository.js';
import { insertAuthSession } from '../session/session.repository.js';

import type { CompleteRegistrationRepository, CreateCompleteRegistrationPersistenceInput } from './complete-registration.types.js';

type Database = NodePgDatabase<typeof schema>;

export class DrizzleCompleteRegistrationRepository implements CompleteRegistrationRepository {
  constructor(private readonly database: Database) {}

  async createRegistrationWithInitialSession(
    input: CreateCompleteRegistrationPersistenceInput,
  ) {
    try {
      return await this.database.transaction(async (transaction) => {
        const user = await insertUserRegistration(transaction, input.registration);

        await insertAuthSession(transaction, {
          userId: user.id,
          tokenHash: input.initialSession.tokenHash,
          expiresAt: input.initialSession.expiresAt,
        });

        return user;
      });
    } catch (error) {
      if (isUsersEmailUniqueViolation(error)) {
        throw new EmailAlreadyExistsError();
      }

      throw error;
    }
  }
}
