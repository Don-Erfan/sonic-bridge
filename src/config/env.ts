/**
 * Centralised, typed access to public environment variables (Facade).
 *
 * Next inlines `NEXT_PUBLIC_*` at build time, so reference them through this
 * single object instead of touching `process.env` across the codebase. The
 * vendored interceptor still reads `process.env` directly; the names below
 * mirror it one-to-one. Server-only secrets (Mattermost) are deliberately
 * *not* here: they are read inside the route handler that needs them.
 */
export const env = {
  /** Base URL for the API. The HTTP client appends a trailing slash. */
  baseApi: process.env.NEXT_PUBLIC_BASE_API ?? ``,
  /** Route the auth flow redirects to when a session cannot be recovered. */
  fallback: process.env.NEXT_PUBLIC_FALLBACK ?? `login`,
  /** Absolute endpoint used to exchange a refresh token for a new access token. */
  refreshTokenRoute: process.env.NEXT_PUBLIC_REFRESH_TOKEN_ROUTE ?? ``,
  /** `true` only for `next dev`. */
  isDevelopment: process.env.NODE_ENV === `development`,
  /** `true` for `next build` / `next start`. */
  isProduction: process.env.NODE_ENV === `production`,
} as const;

export type TEnv = typeof env;
