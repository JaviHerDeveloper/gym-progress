import type { Response } from 'express';

type SetSessionCookieInput = {
  token: string;
  expiresAt: Date;
  isProduction: boolean;
};

export function setSessionCookie(
  response: Response,
  { token, expiresAt, isProduction }: SetSessionCookieInput,
): void {
  response.cookie('gp_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    secure: isProduction,
  });
}
