import nookies from 'nookies';
import { sessionCookies as SESSION_COOKIES } from '@/config';
import { ISessionTokens } from './interface';

/** The refresh token outlives the access token: 30 days. */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const baseOptions = () => ({
  path: `/`,
  sameSite: `lax` as const,
  secure:
    typeof window !== `undefined` && window.location.protocol === `https:`,
});

/** Stores both tokens (browser only). */
export const saveSession = ({ token, refreshToken }: ISessionTokens): void => {
  nookies.set(null, SESSION_COOKIES.token, token, baseOptions());
  nookies.set(null, SESSION_COOKIES.refreshToken, refreshToken, {
    ...baseOptions(),
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
};

/** Removes both tokens (browser only). */
export const clearSession = (): void => {
  nookies.destroy(null, SESSION_COOKIES.token, { path: `/` });
  nookies.destroy(null, SESSION_COOKIES.refreshToken, { path: `/` });
};
