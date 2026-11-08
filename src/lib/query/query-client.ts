import {
  MutationCache,
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';
import { clockStore } from '../clock';
import { defaultRetryStrategy } from './retry';

/**
 * Factory Method for the TanStack `QueryClient`.
 *
 * Every runtime — server render, client hydration, tests — gets an identically
 * configured client. Change a default here once instead of hunting for
 * scattered `new QueryClient()` calls.
 */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    // A successful write changed server state "as of now" (a booking that
    // starts now, a check-in): re-tick the shared clock so time-based UI
    // evaluates the new data against the current instant, not the last tick.
    mutationCache: new MutationCache({
      onSuccess: () => clockStore.refresh(),
    }),
    defaultOptions: {
      queries: {
        // Fresh for a minute: avoids an immediate refetch after SSR hydration
        // and de-duplicates requests between components mounting together.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: defaultRetryStrategy,
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Mutations are not idempotent; never replay them automatically.
        retry: false,
      },
      dehydrate: {
        // Also dehydrate pending queries so streamed SSR can hydrate them.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === `pending`,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

/**
 * Returns the correct client for the current runtime.
 *
 * - **Server:** always a fresh instance, so one request's cache never bleeds
 *   into another user's response.
 * - **Browser:** a lazily-created Singleton, so React re-renders (and Suspense
 *   retries) reuse one cache instead of throwing it away.
 */
export const getQueryClient = (): QueryClient => {
  if (isServer) {
    return createQueryClient();
  }
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
};
