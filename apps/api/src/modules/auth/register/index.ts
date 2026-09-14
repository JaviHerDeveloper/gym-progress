export { EmailAlreadyExistsError } from './register.errors.js';
export { isUsersEmailUniqueViolation } from './register.repository.js';
export { argon2idOptions, createRegisterUserService } from './register.service.js';
export { registerUserInputSchema } from './register.schema.js';
export { registerUser } from './register-user.js';
export type { RegisterUserInput, ValidatedRegisterUserInput } from './register.schema.js';
export type { CreateUserRegistration, RegisteredUser, UserRegistrationRepository } from './register.types.js';
