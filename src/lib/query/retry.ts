import { isAxiosError } from 'axios';
import { TRetryStrategy } from './interface';

/** Upper bound of automatic re-attempts for a single query. */
export const MAX_QUERY_RETRIES = 2;

/**
 * HTTP statuses that are worth retrying: request timeout, rate limiting and
 * transient gateway failures. Every other 4xx is a deterministic client error
 * that would fail identically again.
 */
const RETRYABLE_STATUSES = new Set([408, 425, 429, 502, 503, 504]);

/**
 * Default retry Strategy for queries.
 *
 * - Network failures (no response) and the statuses above are retried up to
 *   {@link MAX_QUERY_RETRIES} times.
 * - Every other HTTP error fails fast, so a 401/403/404/422 never costs extra
 *   round-trips (the auth middleware already refreshes tokens on 401).
 * - Non-HTTP errors (thrown in a `queryFn`, parsing errors) are not retried.
 */
export const defaultRetryStrategy: TRetryStrategy = (failureCount, error) => {
  if (failureCount >= MAX_QUERY_RETRIES || !isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status === undefined || RETRYABLE_STATUSES.has(status);
};
