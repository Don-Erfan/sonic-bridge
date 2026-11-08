import { AxiosResponse, isAxiosError } from 'axios';
import type { INetworkResponse } from '../interceptor';

/** Unwraps the API envelope (`{ code, data, detail }`) to its payload. */
export const unwrap = <T>(response: AxiosResponse<INetworkResponse<T>>): T =>
  response.data.data;

/** HTTP status of a failed request, if the error came from one. */
export const getErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

/** `true` when the server answered 404 Not Found. */
export const isNotFoundError = (error: unknown): boolean =>
  getErrorStatus(error) === 404;

/** Machine-readable `code` of the API envelope of a failed request. */
export const getErrorCode = (error: unknown): string | undefined => {
  if (isAxiosError<INetworkResponse<unknown>>(error)) {
    const code = error.response?.data?.code;
    if (typeof code === `string` && code) return code;
  }
  return undefined;
};

/**
 * Human-readable message of a failed request: the envelope's `detail` when
 * the API sent one, otherwise the provided fallback.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<INetworkResponse<unknown>>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === `string` && detail.trim()) return detail;
  }
  return fallback;
};

/** Multipart body of an image upload: the API reads the field `file`. */
export const toImageForm = (file: File): FormData => {
  const form = new FormData();
  form.append(`file`, file);
  return form;
};
