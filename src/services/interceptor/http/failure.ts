import { AxiosError, isAxiosError, isCancel } from "axios";

/**
 * Transport failures where the request left the browser but no HTTP answer
 * came back: connection refused / reset, DNS or CORS failure (all reported as
 * `ERR_NETWORK`) and timeouts. A cancelled request (`ERR_CANCELED`, e.g. a
 * query aborted on unmount) is deliberately *not* one of them.
 */
const NO_RESPONSE_CODES = new Set<string>([
  AxiosError.ERR_NETWORK,
  AxiosError.ECONNABORTED,
  AxiosError.ETIMEDOUT,
]);

/** `true` when the browser itself reports that it has no network. */
export const isDeviceOffline = (): boolean =>
  typeof navigator !== "undefined" && navigator.onLine === false;

/**
 * `true` when a request failed because of the server side, not the request:
 * the API answered with a 5xx status, or it could not be reached at all
 * (down, restarting, timing out) while the device itself is online.
 *
 * A device without network is not a server failure: the app keeps showing
 * cached data under the offline banner instead.
 */
export const isServerFailure = (error: unknown): boolean => {
  if (!isAxiosError(error) || isCancel(error)) return false;

  const status = error.response?.status;
  if (status !== undefined) return status >= 500;

  return NO_RESPONSE_CODES.has(error.code ?? "") && !isDeviceOffline();
};
