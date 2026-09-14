export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
};

export type CreateUserRegistration = {
  name: string;
  email: string;
  passwordHash: string;
  heightCm: number;
  weightKg: number;
  measuredAt: Date;
};

export interface UserRegistrationRepository {
  createRegistration(input: CreateUserRegistration): Promise<RegisteredUser>;
}
