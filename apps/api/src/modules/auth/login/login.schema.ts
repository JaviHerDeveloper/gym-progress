import { z } from 'zod';

import { emailSchema } from '../shared/email.schema.js';

export const loginUserInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export type LoginUserInput = z.input<typeof loginUserInputSchema>;
export type ValidatedLoginUserInput = z.output<typeof loginUserInputSchema>;
