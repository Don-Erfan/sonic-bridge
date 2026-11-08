/**
 * Session cookie names, shared by the login flow (`services/auth/session`),
 * the interceptor's `AuthMiddleware` (which hard-codes the same names), the
 * route guard (`src/proxy.ts`) and the Mattermost route handler.
 */
export const sessionCookies = {
  token: `token`,
  refreshToken: `refreshToken`,
} as const;
