import { hashPasswordWithArgon2id } from './password-hasher.js';
import { registerUserInputSchema } from './register.schema.js';
import type { RegisterUserInput } from './register.schema.js';
import type { RegisteredUser, UserRegistrationRepository } from './register.types.js';

type RegisterUserDependencies = {
  repository: UserRegistrationRepository;
  hashPassword?: (password: string) => Promise<string>;
  now?: () => Date;
};

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
