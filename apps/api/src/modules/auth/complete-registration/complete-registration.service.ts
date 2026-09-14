import { hashPasswordWithArgon2id } from '../register/password-hasher.js';
import { registerUserInputSchema } from '../register/register.schema.js';
import type { RegisterUserInput } from '../register/register.schema.js';
import { createSessionToken } from '../session/session-token.js';

import type { CompleteRegistrationRepository, RegisteredUserWithInitialSession } from './complete-registration.types.js';

type RegisterUserWithInitialSessionDependencies = {
  repository: CompleteRegistrationRepository;
  hashPassword?: (password: string) => Promise<string>;
  now?: () => Date;
  randomBytes?: (size: number) => Buffer;
};

export function createRegisterUserWithInitialSessionService({
  repository,
  hashPassword = hashPasswordWithArgon2id,
  now = () => new Date(),
  randomBytes,
}: RegisterUserWithInitialSessionDependencies) {
  return async function registerUserWithInitialSession(
    input: RegisterUserInput,
  ): Promise<RegisteredUserWithInitialSession> {
    const validatedInput = registerUserInputSchema.parse(input);
    const passwordHash = await hashPassword(validatedInput.password);
    const createdAt = now();
    const { token, tokenHash, expiresAt } = createSessionToken({
      now: () => createdAt,
      randomBytes,
    });

    const user = await repository.createRegistrationWithInitialSession({
      registration: {
        name: validatedInput.name,
        email: validatedInput.email,
        passwordHash,
        heightCm: validatedInput.heightCm,
        weightKg: validatedInput.weightKg,
        measuredAt: createdAt,
      },
      initialSession: { tokenHash, expiresAt },
    });

    return { user, session: { token, expiresAt } };
  };
}
