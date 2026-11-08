import { AxiosRequestConfig, AxiosResponse } from "axios";
import HttpClient, { appClient } from "../http";

/**
 * Abstract base class for API services.
 * Provides shared HTTP client functionality and standard request methods.
 */
export default abstract class AbstractAPI {
  /**
   * Initializes a new instance of the AbstractAPI class.
   * @param {string} url The base URL endpoint for the specific API service.
   * @param {HttpClient} http The HTTP client to use for requests. Defaults to the standard appClient.
   */
  protected constructor(
    protected readonly url: string,
    protected readonly http: HttpClient = appClient,
  ) {}

  /**
   * Hook to transform the response before it is returned to the caller.
   * Can be overridden by subclasses to provide custom transformation logic.
   * @template T The original response data type.
   * @template R The transformed response data type.
   * @param {AxiosResponse<T>} response The original Axios response.
   * @returns {AxiosResponse<R>} The transformed Axios response.
   * @protected
   */
  protected transformResponse<T = any, R = T>(
    response: AxiosResponse<T>,
  ): AxiosResponse<R> {
    return response as unknown as AxiosResponse<R>;
  }

  /**
   * Hook to validate the request configuration before it is sent.
   * Can be overridden by subclasses.
   * @param {AxiosRequestConfig} config The Axios request configuration.
   * @protected
   */
  protected validateConfig(config: AxiosRequestConfig): void {
    if (!config.url) {
      throw new Error("Request URL is required");
    }
  }

  /**
   * Hook to transform errors before they are thrown to the caller.
   * Can be overridden by subclasses to provide custom error handling or mapping.
   * @param {any} error The error that occurred during the request.
   * @returns {any} The transformed error.
   * @protected
   */
  protected transformError(error: any): any {
    return error;
  }

  /**
   * Performs a generic HTTP request.
   * @template T The expected response data type.
   * @param {AxiosRequestConfig} config The Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} A promise that resolves to the Axios response.
   */
  protected async request<T = any>(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      this.validateConfig(config);
      const response = await this.http.request<T>(config);
      return this.transformResponse<T>(response);
    } catch (error) {
      throw this.transformError(error);
    }
  }

  /**
   * Performs a GET request.
   * @template T The expected response data type.
   * @param {string} path The endpoint path relative to the base URL.
   * @param {AxiosRequestConfig} config Additional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} A promise that resolves to the Axios response.
   */
  protected async get<T = any>(
    path: string = "",
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      ...config,
      method: "GET",
      url: this.buildUrl(path),
    });
  }

  /**
   * Performs a POST request.
   * @template T The expected response data type.
   * @template D The data type to be sent in the request body.
   * @param {string} path The endpoint path relative to the base URL.
   * @param {D} data The data to be sent in the request body.
   * @param {AxiosRequestConfig} config Additional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} A promise that resolves to the Axios response.
   */
  protected async post<T = any, D = any>(
    path: string = "",
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      ...config,
      method: "POST",
      url: this.buildUrl(path),
      data,
    });
  }

  /**
   * Performs a PUT request.
   * @template T The expected response data type.
   * @template D The data type to be sent in the request body.
   * @param {string} path The endpoint path relative to the base URL.
   * @param {D} data The data to be sent in the request body.
   * @param {AxiosRequestConfig} config Additional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} A promise that resolves to the Axios response.
   */
  protected async put<T = any, D = any>(
    path: string = "",
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      ...config,
      method: "PUT",
      url: this.buildUrl(path),
      data,
    });
  }

  /**
   * Performs a PATCH request.
   * @template T The expected response data type.
   * @template D The data type to be sent in the request body.
   * @param {string} path The endpoint path relative to the base URL.
   * @param {D} data The data to be sent in the request body.
   * @param {AxiosRequestConfig} config Additional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} A promise that resolves to the Axios response.
   */
  protected async patch<T = any, D = any>(
    path: string = "",
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      ...config,
      method: "PATCH",
      url: this.buildUrl(path),
      data,
    });
  }

  /**
   * Performs a DELETE request.
   * @template T The expected response data type.
   * @param {string} path The endpoint path relative to the base URL.
   * @param {AxiosRequestConfig} config Additional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} A promise that resolves to the Axios response.
   */
  protected async delete<T = any>(
    path: string = "",
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      ...config,
      method: "DELETE",
      url: this.buildUrl(path),
    });
  }

  /**
   * Downloads a file as a blob.
   * @param {string} path The endpoint path relative to the base URL.
   * @param {AxiosRequestConfig} config Additional Axios request configuration.
   * @returns {Promise<AxiosResponse<Blob>>} A promise that resolves to the Axios response with a Blob.
   */
  protected async download(
    path: string = "",
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Blob>> {
    return this.request<Blob>({
      ...config,
      method: "GET",
      url: this.buildUrl(path),
      responseType: "blob",
    });
  }

  /**
   * Uploads a file using multipart/form-data.
   * The Content-Type header is intentionally not set: Axios generates it,
   * including the multipart boundary, when it detects FormData.
   * @template T The expected response data type.
   * @param {string} path The endpoint path relative to the base URL.
   * @param {FormData} formData The form data containing the file and other fields.
   * @param {AxiosRequestConfig} config Additional Axios request configuration.
   * @returns {Promise<AxiosResponse<T>>} A promise that resolves to the Axios response.
   */
  protected async upload<T = any>(
    path: string = "",
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      ...config,
      method: "POST",
      url: this.buildUrl(path),
      data: formData,
    });
  }

  /**
   * Builds the full URL for a request by combining the base URL and the provided path.
   * Ensures that slashes are correctly handled.
   * @param {string} path The relative path to append to the base URL.
   * @returns {string} The full URL.
   * @private
   */
  private buildUrl(path: string): string {
    if (!path) return this.url;
    if (/^https?:\/\//i.test(path)) return path;
    const cleanUrl = this.url.endsWith("/") ? this.url.slice(0, -1) : this.url;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanUrl}${cleanPath}`;
  }
}
