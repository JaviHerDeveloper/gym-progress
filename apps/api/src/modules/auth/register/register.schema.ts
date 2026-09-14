import { z } from 'zod';

export const registerUserInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(8).max(128),
  heightCm: z.number().finite().min(100).max(250),
  weightKg: z.number().finite().min(30).max(300),
});

export type RegisterUserInput = z.input<typeof registerUserInputSchema>;
export type ValidatedRegisterUserInput = z.output<typeof registerUserInputSchema>;
