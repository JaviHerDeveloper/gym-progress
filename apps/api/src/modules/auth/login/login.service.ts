import { verifyPasswordWithArgon2id } from '../shared/password-hasher.js';
import { createSessionToken } from '../session/session-token.js';
import type { PreparedSessionToken } from '../session/session-token.js';

import { InvalidCredentialsError } from './login.errors.js';
import { loginUserInputSchema } from './login.schema.js';
import type { LoginUserInput } from './login.schema.js';
import type { LoggedInUser, LoginRepository } from './login.types.js';

type LoginUserDependencies = {
  repository: LoginRepository;
  verifyPassword?: (password: string, passwordHash: string) => Promise<boolean>;
  prepareSession?: () => PreparedSessionToken;
};

export function createLoginUserService({
  repository,
  verifyPassword = verifyPasswordWithArgon2id,
  prepareSession = createSessionToken,
}: LoginUserDependencies) {
  return async function loginUser(input: LoginUserInput): Promise<LoggedInUser> {
    const validatedInput = loginUserInputSchema.parse(input);
    const user = await repository.findUserByEmail(validatedInput.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await verifyPassword(validatedInput.password, user.passwordHash);

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const { token, tokenHash, expiresAt } = prepareSession();

    await repository.createSession({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      session: { token, expiresAt },
    };
  };
}
