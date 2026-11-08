/*
 * Ozone staff PWA — service worker.
 *
 * Strategies (one per request kind):
 *   page navigations      network-first → cached page → /offline
 *   /_next/static/*       cache-first (content-hashed, immutable)
 *   fonts, images, icons  stale-while-revalidate
 *   everything else       network only (API data, RSC payloads, /api/*)
 *
 * API responses are never cached here: they are personal and change by the
 * minute; TanStack Query keeps the in-memory copy shown while offline.
 *
 * Updates: a new worker installs in the background and *waits*. The page
 * shows "new version ready"; when the user accepts, it posts SKIP_WAITING
 * and reloads on `controllerchange` (see src/lib/pwa/service-worker.ts).
 * Bump VERSION whenever this file's caching behaviour changes.
 *
 * Push: shows the notifications the server sends (order handed over /
 * cancelled), also while the app is closed, and opens the linked page when
 * one is tapped.
 *
 * Development (`/sw.js?dev=1`): only push is active. Nothing is precached
 * or served from a cache, so code changes always show, and caches left by a
 * production build on the same origin are deleted.
 */
const VERSION = `v2`;
const IS_DEV = new URLSearchParams(self.location.search).get(`dev`) === `1`;
const SHELL_CACHE = `ozone-shell-${VERSION}`;
const PAGE_CACHE = `ozone-pages-${VERSION}`;
const STATIC_CACHE = `ozone-static-${VERSION}`;
const ASSET_CACHE = `ozone-assets-${VERSION}`;
const CURRENT_CACHES = new Set([
  SHELL_CACHE,
  PAGE_CACHE,
  STATIC_CACHE,
  ASSET_CACHE,
]);

const OFFLINE_URL = `/offline`;
const PRECACHE_URLS = [
  OFFLINE_URL,
  `/manifest.webmanifest`,
  `/icon.svg`,
  `/icons/icon-192.png`,
  `/icons/icon-512.png`,
];

/** Pages kept for offline use; oldest entries are evicted beyond this. */
const MAX_CACHED_PAGES = 30;

self.addEventListener(`install`, (event) => {
  if (IS_DEV) {
    // No update prompt in development: the newest worker takes over.
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener(`activate`, (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(`ozone-`) && (IS_DEV || !CURRENT_CACHES.has(key)),
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener(`message`, (event) => {
  if (event.data && event.data.type === `SKIP_WAITING`) self.skipWaiting();
});

/** Only complete, same-origin, non-redirected responses are worth caching. */
const isCacheable = (response) =>
  response && response.ok && response.type === `basic` && !response.redirected;

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(
    keys
      .slice(0, Math.max(0, keys.length - maxEntries))
      .map((key) => cache.delete(key)),
  );
};

const networkFirstPage = async (request) => {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
      void trimCache(PAGE_CACHE, MAX_CACHED_PAGES);
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    return cached || (await caches.match(OFFLINE_URL)) || Response.error();
  }
};

const cacheFirst = async (request, cacheName) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) void cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
};

self.addEventListener(`fetch`, (event) => {
  if (IS_DEV) return;
  const { request } = event;
  if (request.method !== `GET`) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith(`/api/`)) return;
  // React Server Component payloads of client-side navigations.
  if (request.headers.get(`RSC`) === `1` || url.searchParams.has(`_rsc`))
    return;

  if (request.mode === `navigate`) {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (url.pathname.startsWith(`/_next/static/`)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  if (
    request.destination === `font` ||
    request.destination === `image` ||
    url.pathname.startsWith(`/icons/`)
  ) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
  }
});

/* ---------------------------------------------------------------- Push --- */

/** Sent to open pages when a notification arrives (see src/lib/pwa/push.ts). */
const PUSH_RECEIVED_MESSAGE = `PUSH_RECEIVED`;
const DEFAULT_TITLE = `اوزون`;

/** The server's payload `{ title, body, url, tag }`; tolerant of bad data. */
const readPush = (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    return {
      title:
        typeof data.title === `string` && data.title
          ? data.title
          : DEFAULT_TITLE,
      body: typeof data.body === `string` ? data.body : ``,
      url: typeof data.url === `string` ? data.url : `/`,
      tag: typeof data.tag === `string` && data.tag ? data.tag : undefined,
    };
  } catch {
    return { title: DEFAULT_TITLE, body: ``, url: `/`, tag: undefined };
  }
};

/** Only paths of this app are opened; anything else falls back to home. */
const toAppUrl = (value) => {
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin
      ? url.href
      : self.location.origin + `/`;
  } catch {
    return self.location.origin + `/`;
  }
};

self.addEventListener(`push`, (event) => {
  const push = readPush(event);
  event.waitUntil(
    (async () => {
      // Always show one: browsers require a visible notification per push.
      await self.registration.showNotification(push.title, {
        body: push.body,
        icon: `/icons/icon-192.png`,
        badge: `/icons/badge-96.png`,
        lang: `fa`,
        dir: `rtl`,
        tag: push.tag,
        // A newer update of the same order replaces the old one, audibly.
        renotify: Boolean(push.tag),
        data: { url: toAppUrl(push.url) },
      });
      const windows = await self.clients.matchAll({
        type: `window`,
        includeUncontrolled: true,
      });
      for (const client of windows) {
        client.postMessage({ type: PUSH_RECEIVED_MESSAGE });
      }
    })(),
  );
});

self.addEventListener(`notificationclick`, (event) => {
  event.notification.close();
  const url = toAppUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: `window`,
        includeUncontrolled: true,
      });
      const client =
        windows.find((item) => item.focused) ||
        windows.find(
          (item) => new URL(item.url).origin === self.location.origin,
        );
      if (client) {
        try {
          const focused = await client.focus();
          if (focused.url !== url && `navigate` in focused) {
            await focused.navigate(url);
          }
          return;
        } catch {
          // Not controlled by this worker / cannot focus: open a new window.
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});

/*
 * The push service replaced or expired the subscription. The worker cannot
 * call the API (it may live on another origin and needs the session), so
 * it only makes sure the browser holds a subscription again; the app sends
 * it to the server the next time it opens (see `usePushSync`).
 */
self.addEventListener(`pushsubscriptionchange`, (event) => {
  const key =
    event.oldSubscription && event.oldSubscription.options.applicationServerKey;
  if (event.newSubscription || !key) return;
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey: key })
      .catch(() => undefined),
  );
});
