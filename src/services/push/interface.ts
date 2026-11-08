/** `GET /push/config`. */
export interface IPushConfig {
  /** The server's VAPID public key (base64url): the `applicationServerKey`. */
  publicKey: string;
}

/** What the push services answered (`POST /push/test`). */
export interface IPushDeliveryReport {
  /** Handed to the push service: the device shows it within seconds. */
  delivered: number;
  /** Not delivered this time. */
  failed: number;
  /** Registrations found invalid and forgotten. */
  removed: number;
}

/** A browser's `PushSubscription.toJSON()`, as `POST /push/subscriptions` takes it. */
export interface IPushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Web Push API contract. The server notifies the signed-in person's
 * registered browsers (an order handed over or cancelled), also while the
 * app is closed; signing out stops them for that session.
 */
export interface IPushService {
  /** `GET /push/config` — 409 `push_unavailable` when the server has no keys. */
  getConfig(): Promise<IPushConfig>;
  /** `POST /push/subscriptions` — idempotent. */
  subscribe(payload: IPushSubscriptionPayload): Promise<void>;
  /** `POST /push/unsubscribe` — idempotent. */
  unsubscribe(endpoint: string): Promise<void>;
  /** `POST /push/test` — a test notification to all of the caller's browsers (5 per minute). */
  sendTest(): Promise<IPushDeliveryReport>;
}
