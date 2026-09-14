import argon2 from 'argon2';

import { registerUserInputSchema } from './register.schema.js';
import type { RegisterUserInput } from './register.schema.js';
import type { RegisteredUser, UserRegistrationRepository } from './register.types.js';

export const argon2idOptions = {
  type: argon2.argon2id,
  memoryCost: 19 * 1024,
  timeCost: 2,
  parallelism: 1,
} as const;

type RegisterUserDependencies = {
  repository: UserRegistrationRepository;
  hashPassword?: (password: string) => Promise<string>;
  now?: () => Date;
};

async function hashPasswordWithArgon2id(password: string): Promise<string> {
  return argon2.hash(password, argon2idOptions);
}

export function createRegisterUserService({
  repository,
  hashPassword = hashPasswordWithArgon2id,
  now = () => new Date(),
}: RegisterUserDependencies) {
  return async function registerUser(input: RegisterUserInput): Promise<RegisteredUser> {
    const validatedInput = registerUserInputSchema.parse(input);
    const passwordHash = await hashPassword(validatedInput.password);

    return repository.createRegistration({
      name: validatedInput.name,
      email: validatedInput.email,
      passwordHash,
      heightCm: validatedInput.heightCm,
      weightKg: validatedInput.weightKg,
      measuredAt: now(),
    });
  };
}
