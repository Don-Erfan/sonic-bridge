import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import nookies from "nookies";
import { IMiddleware } from "./interface";
import type { IHttpClient } from "../client/interface";
import type { INetworkResponse } from "../../abstractApi/interface";
import { isServerFailure } from "../failure";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

interface QueuedRequest {
  config: RetriableRequestConfig;
  resolve: (response: AxiosResponse) => void;
  reject: (error: unknown) => void;
}

/** Matches `services/auth/session.ts`: the refresh token lives 30 days. */
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Endpoints whose 401 is an answer, not an expired session: a wrong password
 * on `auth/login` must reach the login form, and a rejected `auth/refresh`
 * must not trigger another refresh.
 */
const SESSIONLESS_ENDPOINT = /(?:^|\/)auth\/(?:login|refresh)\/?(?:\?.*)?$/;

/**
 * Attaches the access token to outgoing requests and transparently refreshes
 * it on 401 responses. Concurrent 401s share a single refresh: the first one
 * triggers the refresh call while the others queue up and are replayed once
 * the new token is available. A request is retried at most once (`_retry`).
 *
 * The server rotates the refresh token on every use. When two tabs refresh at
 * the same moment, the slower one is rejected; it then picks up the tokens
 * the faster tab already stored (cookies are shared) instead of signing out.
 */
export default class AuthMiddleware implements IMiddleware {
  private client?: IHttpClient;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];

  private readonly tokenKey = "token";
  private readonly refreshTokenKey = "refreshToken";

  private get fallbackUrl(): string {
    const fallback = process.env.NEXT_PUBLIC_FALLBACK || "login";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/${fallback}`;
  }

  /** Same attributes as `saveSession`, so a refresh never downgrades them. */
  private cookieOptions(maxAge?: number) {
    return {
      path: "/",
      sameSite: "lax" as const,
      secure:
        typeof window !== "undefined" && window.location.protocol === "https:",
      ...(maxAge ? { maxAge } : {}),
    };
  }

  onBoot(client: IHttpClient): void {
    this.client = client;
  }

  async onRequest(
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> {
    if (typeof window !== "undefined") {
      const cookies = nookies.get();
      const token = cookies[this.tokenKey];
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  }

  async onResponseError(
    error: AxiosError<INetworkResponse<null>>,
  ): Promise<AxiosResponse> {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      SESSIONLESS_ENDPOINT.test(originalRequest.url ?? "") ||
      // The refresh flow reads/writes cookies and redirects via
      // window.location, none of which exist during SSR.
      typeof window === "undefined"
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (this.isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        this.failedQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    const refreshToken = nookies.get()[this.refreshTokenKey];
    if (!refreshToken) {
      this.handleAuthFailure();
      return Promise.reject(error);
    }

    this.isRefreshing = true;
    try {
      const newToken = await this.obtainAccessToken(refreshToken);
      this.flushQueue(null, newToken);
      return await this.retry(originalRequest, newToken);
    } catch (refreshError) {
      this.flushQueue(refreshError);
      // An API that is down or failing says nothing about the session: keep
      // the tokens and let ErrorMiddleware show the server-error page. Only
      // a refresh the server actually refused signs the user out.
      if (!isServerFailure(refreshError)) this.handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Refreshes; if the server rejects a refresh token that another tab has
   * meanwhile rotated, adopts that tab's fresh access token instead.
   */
  private async obtainAccessToken(refreshToken: string): Promise<string> {
    try {
      return await this.refreshAccessToken(refreshToken);
    } catch (refreshError) {
      const cookies = nookies.get();
      const rotatedElsewhere =
        axios.isAxiosError(refreshError) &&
        refreshError.response?.status === 401 &&
        cookies[this.refreshTokenKey] &&
        cookies[this.refreshTokenKey] !== refreshToken &&
        cookies[this.tokenKey];
      if (rotatedElsewhere) return cookies[this.tokenKey];
      throw refreshError;
    }
  }

  /**
   * Exchanges the refresh token for a new access token and persists it.
   * Uses a bare axios call (not the intercepted client) so a failing refresh
   * request can never recursively re-enter this middleware.
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const refreshRoute = process.env.NEXT_PUBLIC_REFRESH_TOKEN_ROUTE;
    if (!refreshRoute) {
      throw new Error("NEXT_PUBLIC_REFRESH_TOKEN_ROUTE is not defined");
    }

    const resp = await axios.post(
      refreshRoute,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          Accept: "application/json",
        },
        timeout: 15_000,
      },
    );

    const newToken = resp.data?.token ?? resp.data?.data?.token;
    if (!newToken) {
      throw new Error("Invalid refresh token response");
    }

    nookies.set(null, this.tokenKey, newToken, this.cookieOptions());

    // The server rotates the refresh token on every use: store the new one,
    // keeping its 30-day lifetime.
    const newRefreshToken =
      resp.data?.refreshToken ?? resp.data?.data?.refreshToken;
    if (newRefreshToken) {
      nookies.set(
        null,
        this.refreshTokenKey,
        newRefreshToken,
        this.cookieOptions(REFRESH_MAX_AGE_SECONDS),
      );
    }

    return newToken;
  }

  /**
   * Re-sends a request through the client so it passes back through the full
   * interceptor chain, resolving with a real response (not a config object).
   */
  private retry(
    config: RetriableRequestConfig,
    token: string,
  ): Promise<AxiosResponse> {
    if (!this.client) {
      return Promise.reject(
        new Error("AuthMiddleware: client not available; was boot() called?"),
      );
    }
    config.headers.Authorization = `Bearer ${token}`;
    return this.client.request(config);
  }

  /**
   * Settles every queued request: retries them with the new token, or rejects
   * them all so no caller is left hanging when the refresh fails.
   */
  private flushQueue(error: unknown, token?: string): void {
    const queue = this.failedQueue;
    this.failedQueue = [];

    queue.forEach(({ config, resolve, reject }) => {
      if (error || !token) {
        reject(error ?? new Error("Token refresh failed"));
        return;
      }
      this.retry(config, token).then(resolve).catch(reject);
    });
  }

  private handleAuthFailure(): void {
    nookies.destroy(null, this.tokenKey, { path: "/" });
    nookies.destroy(null, this.refreshTokenKey, { path: "/" });
    if (typeof window !== "undefined") {
      window.location.replace(this.fallbackUrl);
    }
  }
}
