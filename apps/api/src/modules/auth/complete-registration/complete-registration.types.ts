import type { CreateUserRegistration, RegisteredUser } from '../register/register.types.js';
import type { CreateSessionPersistenceInput } from '../session/session.types.js';

export type CreateCompleteRegistrationPersistenceInput = {
  registration: CreateUserRegistration;
  initialSession: Omit<CreateSessionPersistenceInput, 'userId'>;
};

export interface CompleteRegistrationRepository {
  createRegistrationWithInitialSession(
    input: CreateCompleteRegistrationPersistenceInput,
  ): Promise<RegisteredUser>;
}

export type RegisteredUserWithInitialSession = {
  user: RegisteredUser;
  session: {
    token: string;
    expiresAt: Date;
  };
};
