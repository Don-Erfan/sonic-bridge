import { HttpClient } from '../interceptor';

/**
 * HTTP client for the app's *own* route handlers (`/api/*`), as opposed to
 * the staff API. The session cookie travels automatically (same origin), so
 * no auth middleware is needed — and deliberately no `ErrorMiddleware`: a
 * failed background sync must never redirect the user to the 5xx page.
 */
export const internalApiClient = new HttpClient({
  baseURL: `/api/`,
  timeout: 15_000,
  headers: { Accept: `application/json` },
}).boot();
