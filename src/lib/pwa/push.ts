import { SERVICE_WORKER_URL } from './service-worker';

/**
 * Browser side of Web Push: capability checks, the browser's
 * `PushSubscription`, and who it belongs to on this device.
 *
 * Notifications require a secure context (HTTPS, or `localhost`), a service
 * worker and the Push API. On iPhone / iPad they exist only in the app
 * added to the Home Screen (iOS 16.4+), never in a Safari tab.
 */

/** Why this browser cannot receive notifications, or `null` when it can. */
export type TPushBlocker =
  /** iOS / iPadOS outside the Home Screen app. */
  | `install-required`
  /** Plain `http` on a non-local address. */
  | `insecure`
  /** No service worker / Push API / Notification API at all. */
  | `unsupported`;

/** Who enabled notifications in this browser (a profile id). */
const OWNER_STORAGE_KEY = `ozone.push.owner`;

/** How long to wait for the service worker before giving up. */
const READY_TIMEOUT_MS = 10_000;

const isIos = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.userAgent.includes(`Macintosh`) && navigator.maxTouchPoints > 1);

const isStandalone = (): boolean =>
  window.matchMedia(`(display-mode: standalone)`).matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const getPushBlocker = (): TPushBlocker | null => {
  if (typeof window === `undefined`) return `unsupported`;
  if (!window.isSecureContext) return `insecure`;
  const hasApis =
    `serviceWorker` in navigator &&
    `PushManager` in window &&
    `Notification` in window;
  if (hasApis) return null;
  return isIos() && !isStandalone() ? `install-required` : `unsupported`;
};

export const getNotificationPermission = (): NotificationPermission =>
  typeof Notification === `undefined` ? `denied` : Notification.permission;

/** Base64url (the server's key format) → bytes, as `applicationServerKey` takes them. */
export const base64UrlToBytes = (value: string): Uint8Array<ArrayBuffer> => {
  const base64 = (value + `===`.slice((value.length + 3) % 4))
    .replace(/-/g, `+`)
    .replace(/_/g, `/`);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const sameBytes = (a: ArrayBuffer | null, b: Uint8Array): boolean => {
  if (!a || a.byteLength !== b.byteLength) return false;
  const view = new Uint8Array(a);
  return view.every((byte, index) => byte === b[index]);
};

/** The registration, waiting for the worker to activate (bounded). */
const getRegistration = async (): Promise<ServiceWorkerRegistration> => {
  const existing = await navigator.serviceWorker.getRegistration(`/`);
  if (existing?.active) return existing;
  if (!existing) await navigator.serviceWorker.register(SERVICE_WORKER_URL);
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Service worker not ready`)),
        READY_TIMEOUT_MS,
      ),
    ),
  ]);
};

/** This browser's current subscription, if any (never prompts). */
export const getBrowserSubscription =
  async (): Promise<PushSubscription | null> => {
    if (getPushBlocker()) return null;
    const registration = await navigator.serviceWorker.getRegistration(`/`);
    return (await registration?.pushManager.getSubscription()) ?? null;
  };

/**
 * Subscribes this browser with the server's key. An existing subscription
 * made with another key (the server's key pair changed) is replaced, since
 * the server could no longer sign for it. Must follow a user gesture when
 * permission is still `default` (the browser shows its prompt).
 */
export const subscribeBrowser = async (
  publicKey: string,
): Promise<PushSubscription> => {
  const key = base64UrlToBytes(publicKey);
  const registration = await getRegistration();
  const current = await registration.pushManager.getSubscription();
  if (current) {
    if (sameBytes(current.options.applicationServerKey, key)) return current;
    await current.unsubscribe();
  }
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
};

/** Removes this browser's subscription; returns its endpoint, if there was one. */
export const unsubscribeBrowser = async (): Promise<string | null> => {
  const subscription = await getBrowserSubscription();
  if (!subscription) return null;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  return endpoint;
};

/** Whether the subscription still uses the server's current key. */
export const usesKey = (
  subscription: PushSubscription,
  publicKey: string,
): boolean =>
  sameBytes(
    subscription.options.applicationServerKey,
    base64UrlToBytes(publicKey),
  );

/** The payload the server expects (`PushSubscription.toJSON()`). */
export const toSubscriptionPayload = (subscription: PushSubscription) => {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? ``, auth: json.keys?.auth ?? `` },
  };
};

const readStorage = (): string | null => {
  try {
    return window.localStorage.getItem(OWNER_STORAGE_KEY);
  } catch {
    return null;
  }
};

/** The profile id that enabled notifications in this browser. */
export const pushOwner = {
  get: readStorage,
  set: (profileId: string): void => {
    try {
      window.localStorage.setItem(OWNER_STORAGE_KEY, profileId);
    } catch {
      // Private mode: notifications still work, only re-sync is skipped.
    }
  },
  clear: (): void => {
    try {
      window.localStorage.removeItem(OWNER_STORAGE_KEY);
    } catch {
      // Nothing stored.
    }
  },
};

/** Message the service worker posts to open pages when a notification arrives. */
export const PUSH_RECEIVED_MESSAGE = `PUSH_RECEIVED`;
