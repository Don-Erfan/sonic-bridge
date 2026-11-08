import { AxiosError } from "axios";
import { IMiddleware } from "./interface";
import type { INetworkResponse } from "../../abstractApi";
import { isServerFailure } from "../failure";

/** The designed "server error" page (`app/error/e5xx`). */
const SERVER_ERROR_PATH = "/error/e5xx";

/**
 * Sends the browser to the server-error page when the API fails on its side:
 * a 5xx answer, or no answer at all because the API is down or timing out
 * (see `isServerFailure`). Cancelled requests, 4xx answers and a device
 * without network are left to the caller.
 *
 * The error is always re-thrown so callers never receive an `undefined`
 * response while the navigation is still in flight.
 */
export default class ErrorMiddleware implements IMiddleware {
  async onResponseError(
    error: AxiosError<INetworkResponse<null>>,
  ): Promise<never> {
    if (
      isServerFailure(error) &&
      typeof window !== "undefined" &&
      window.location.pathname !== SERVER_ERROR_PATH
    ) {
      // `replace`: the back button must not lead to the page that just failed.
      window.location.replace(SERVER_ERROR_PATH);
    }

    throw error;
  }
}
