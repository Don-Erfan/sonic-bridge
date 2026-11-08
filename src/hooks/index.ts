/**
 * Shared hooks barrel.
 *
 * Feature data hooks are grouped in their own directory (`rooms/`,
 * `wallet/`…) as `<feature>.hook.ts` + `index.ts` and sit over the matching
 * service in `@/services`. Standalone utility hooks stay as a single file
 * (`useThing.ts`). Component-scoped hooks live inside their component folder
 * as `hooks.ts`.
 */
export * from './admin';
export * from './attendance';
export * from './auth';
export * from './events';
export * from './mood';
export * from './profile';
export * from './rooms';
export * from './staff';
export * from './store';
export * from './useAsyncAction';
export * from './useInstallPrompt';
export * from './useNow';
export * from './useOnlineStatus';
export * from './useTheme';
export * from './wallet';
