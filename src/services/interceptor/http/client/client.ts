import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from "axios";
import { IMiddleware } from "../middlewares";
import { IHttpClient } from "./interface";

/**
 * Represents an HTTP client to make requests using Axios as the underlying adapter.
 * Allows for the addition of middleware to intercept requests and responses.
 *
 * Middleware runs in registration order for both the request and the response
 * phase, regardless of Axios' internal interceptor ordering.
 *
 * @class HttpClient
 * @implements {IHttpClient}
 */
export default class HttpClient implements IHttpClient {
  /**
   * The Axios instance used by the HTTP client.
   *
   * @private
   * @type {AxiosInstance}
   */
  private readonly adapter: AxiosInstance;

  /**
   * The middleware registered on this client, in registration order.
   *
   * @private
   * @type {IMiddleware[]}
   */
  private readonly registry: IMiddleware[] = [];

  /**
   * Indicates whether the HttpClient has been booted and is ready to make requests.
   *
   * @private
   * @type {boolean}
   */
  private booted = false;

  /**
   * Creates an instance of HttpClient.
   *
   * @param {CreateAxiosDefaults} [config] The Axios configuration used to create the Axios instance.
   */
  constructor(config?: CreateAxiosDefaults) {
    this.adapter = axios.create(config);
  }

  /**
   * Whether the client has been booted.
   *
   * @public
   * @returns {boolean}
   */
  public get isBooted(): boolean {
    return this.booted;
  }

  /**
   * The registered middleware, in registration order.
   *
   * @public
   * @returns {readonly IMiddleware[]}
   */
  public get middlewares(): readonly IMiddleware[] {
    return this.registry;
  }

  /**
   * Registers one or more middleware. Duplicate instances are ignored.
   *
   * @public
   * @param {...IMiddleware} middlewares The middleware to register.
   * @throws {Error} If called after the client has been booted.
   * @returns {this} The client, for chaining.
   */
  public use(...middlewares: IMiddleware[]): this {
    if (this.booted) {
      throw new Error("HttpClient: cannot add middleware after boot()");
    }
    for (const middleware of middlewares) {
      if (!this.registry.includes(middleware)) {
        this.registry.push(middleware);
      }
    }
    return this;
  }

  /**
   * Boots the HttpClient, registering the middleware on the Axios instance.
   * Middleware whose `environment` does not match the current NODE_ENV is skipped.
   * After this method is called, no more middleware can be added.
   *
   * @public
   * @throws {Error} If the client has already been booted.
   * @returns {this} The client, for chaining.
   */
  public boot(): this {
    if (this.booted) {
      throw new Error("HttpClient: boot() may only be called once");
    }
    this.booted = true;

    const active = this.registry.filter(
      (mw) => !mw.environment || mw.environment === process.env.NODE_ENV,
    );

    active.forEach((mw) => mw.onBoot?.(this));

    // Axios runs request interceptors in reverse registration order (LIFO),
    // so register them reversed to preserve middleware registration order.
    [...active].reverse().forEach((mw) => {
      this.adapter.interceptors.request.use(
        mw.onRequest && ((config) => mw.onRequest!(config)),
        mw.onRequestError && ((error) => mw.onRequestError!(error)),
      );
    });

    // Response interceptors run in registration order (FIFO).
    active.forEach((mw) => {
      this.adapter.interceptors.response.use(
        mw.onResponse && ((response) => mw.onResponse!(response)),
        mw.onResponseError && ((error) => mw.onResponseError!(error)),
      );
    });

    return this;
  }

  /**
   * Makes an HTTP request using the Axios instance.
   *
   * @template T The expected response data type.
   * @template R The Axios response type, defaulting to AxiosResponse<T>.
   * @param {AxiosRequestConfig} config The Axios request configuration.
   * @throws {Error} Throws an error if the HttpClient has not been booted yet.
   * @returns {Promise<R>} A promise that resolves to the Axios response.
   */
  public request<T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig,
  ): Promise<R> {
    if (!this.booted) {
      throw new Error(
        "HttpClient: boot() must be called before making requests",
      );
    }
    // axios >=1.20 types `request` with a deferred conditional return
    // (AxiosResponseResult), which TS cannot narrow back to a generic `R`.
    // The runtime result is exactly `R`, so assert it here.
    return this.adapter.request<T, R>(config) as Promise<R>;
  }
}