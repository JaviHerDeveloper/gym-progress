export type CreateSessionPersistenceInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type CreatedSession = {
  token: string;
  expiresAt: Date;
};

export interface SessionRepository {
  createSession(input: CreateSessionPersistenceInput): Promise<void>;
}

export type ValidatedSession = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
};

export interface SessionValidationRepository {
  findSessionByTokenHash(tokenHash: string): Promise<ValidatedSession | null>;
}
