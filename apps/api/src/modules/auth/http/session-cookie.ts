import type { Response } from 'express';

export const SESSION_COOKIE_NAME = 'gp_session';

type SetSessionCookieInput = {
  token: string;
  expiresAt: Date;
  isProduction: boolean;
};

function getSessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: isProduction,
  };
}

export function setSessionCookie(
  response: Response,
  { token, expiresAt, isProduction }: SetSessionCookieInput,
): void {
  response.cookie(SESSION_COOKIE_NAME, token, {
    ...getSessionCookieOptions(isProduction),
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: Response, isProduction: boolean): void {
  response.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(isProduction));
}
