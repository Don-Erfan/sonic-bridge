import { AxiosRequestConfig, AxiosResponse } from "axios";
import { IMiddleware } from "../middlewares";

/**
 * Interface for HttpClient to ensure implementation consistency.
 * Defines the structure for making HTTP requests and managing middleware.
 */
export interface IHttpClient {
  /**
   * Whether the client has been booted and is ready to make requests.
   */
  readonly isBooted: boolean;

  /**
   * The middleware registered on this client, in registration order.
   * Read-only: use `use()` to register middleware.
   */
  readonly middlewares: readonly IMiddleware[];

  /**
   * Registers one or more middleware. Must be called before `boot()`.
   * @param middlewares The middleware to register, executed in registration order.
   * @returns The client, for chaining.
   */
  use(...middlewares: IMiddleware[]): this;

  /**
   * Boots the HTTP client, preparing it for making requests.
   * This typically includes applying any middleware.
   * @returns The client, for chaining.
   */
  boot(): this;

  /**
   * Makes an HTTP request with the given configuration.
   * @param config The Axios request configuration.
   * @returns A Promise that resolves to the Axios response.
   */
  request<T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig,
  ): Promise<R>;
}