import type { CreateSessionPersistenceInput } from '../session/session.types.js';

export type LoginUserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type LoggedInUser = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  session: {
    token: string;
    expiresAt: Date;
  };
};

export interface LoginRepository {
  findUserByEmail(email: string): Promise<LoginUserRecord | null>;
  createSession(input: CreateSessionPersistenceInput): Promise<void>;
}
