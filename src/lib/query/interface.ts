import type { QueryKey } from '@tanstack/react-query';

/**
 * Alias over TanStack's `QueryKey` so feature key-factories share one type and
 * the dependency stays behind our own boundary.
 */
export type TQueryKey = QueryKey;

/**
 * Shape of a feature key-factory built on top of `queryKeys.root`.
 * `all` is the branch root; every other member derives from it.
 */
export interface IFeatureQueryKeys {
  all: TQueryKey;
  [scope: string]: TQueryKey | ((...args: never[]) => TQueryKey);
}

/**
 * Retry policy (Strategy): decides whether a failed query is attempted again.
 * Same signature as TanStack's `retry` option.
 */
export type TRetryStrategy = (failureCount: number, error: unknown) => boolean;
