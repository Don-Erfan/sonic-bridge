import { env } from '@/config';

/** Message the page sends to a waiting worker to activate it. */
export const SKIP_WAITING_MESSAGE = { type: `SKIP_WAITING` } as const;

/**
 * The worker script (served uncached, see `next.config.ts`). Development
 * builds load it in dev mode: push only, no caching, so code changes always
 * show (see `public/sw.js`).
 */
export const SERVICE_WORKER_URL = env.isProduction ? `/sw.js` : `/sw.js?dev=1`;

/**
 * Called when a new version of the app is installed and waiting. Invoke
 * `activate` to switch to it; the page reloads once the new worker controls
 * it.
 */
export type TUpdateListener = (activate: () => void) => void;

/**
 * Registers the service worker and reports updates instead of applying them
 * silently: a mid-task reload could discard what the user was typing, so the
 * user decides when (see `ServiceWorkerRegistrar`).
 *
 * Returns a cleanup function. Browser-only; no-op where unsupported.
 */
export const registerServiceWorker = (
  onUpdate: TUpdateListener,
): (() => void) => {
  if (!(`serviceWorker` in navigator)) return () => {};

  let isReloading = false;
  const onControllerChange = () => {
    // Only reload for an update the user accepted, not the first install.
    if (isReloading) return;
    isReloading = true;
    window.location.reload();
  };

  let didRequestUpdate = false;
  const requestUpdate = (worker: ServiceWorker) => {
    if (didRequestUpdate) return;
    didRequestUpdate = true;
    onUpdate(() => {
      navigator.serviceWorker.addEventListener(
        `controllerchange`,
        onControllerChange,
      );
      // ServiceWorker.postMessage has no `targetOrigin` (unlike window's).
      // oxlint-disable-next-line unicorn/require-post-message-target-origin
      worker.postMessage(SKIP_WAITING_MESSAGE);
    });
  };

  void navigator.serviceWorker
    .register(SERVICE_WORKER_URL, { scope: `/` })
    .then((registration) => {
      // The dev worker activates itself at once: no update prompt.
      if (!env.isProduction) return;
      // An update finished installing during a previous visit.
      if (registration.waiting && navigator.serviceWorker.controller) {
        requestUpdate(registration.waiting);
      }
      registration.addEventListener(`updatefound`, () => {
        const installing = registration.installing;
        installing?.addEventListener(`statechange`, () => {
          // `controller` is null on the very first install: nothing to update.
          if (
            installing.state === `installed` &&
            navigator.serviceWorker.controller
          ) {
            requestUpdate(installing);
          }
        });
      });
    })
    .catch((error: unknown) => {
      console.error(`Service worker registration failed`, error);
    });

  return () => {
    navigator.serviceWorker.removeEventListener(
      `controllerchange`,
      onControllerChange,
    );
  };
};
