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
