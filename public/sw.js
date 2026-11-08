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
 */
const VERSION = `v1`;
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
          .filter((key) => key.startsWith(`ozone-`) && !CURRENT_CACHES.has(key))
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
