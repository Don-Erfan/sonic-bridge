import { normalizeDigits } from '@/lib/utils';

/**
 * A whole number typed by an administrator (Persian or Latin digits, an
 * optional leading minus), or `null` when the text is not one. Bounds are
 * left to the API, which answers a Persian message for out-of-range values.
 */
export const parseInteger = (text: string): number | null => {
  const value = normalizeDigits(text).trim();
  if (!/^-?\d{1,9}$/.test(value)) return null;
  return Number.parseInt(value, 10);
};

/** Like {@link parseInteger}, but empty text means "none" (`null`). */
export const parseOptionalInteger = (
  text: string,
): { value: number | null; isValid: boolean } => {
  if (!normalizeDigits(text).trim()) return { value: null, isValid: true };
  const value = parseInteger(text);
  return { value, isValid: value !== null };
};

/** Empty or whitespace-only text becomes `null`. */
export const toOptionalText = (text: string): string | null =>
  text.trim() ? text.trim() : null;

const pad = (value: number) => String(value).padStart(2, `0`);

/**
 * `<input type="datetime-local">` value (`YYYY-MM-DDTHH:mm`, local time) of
 * an instant. The browser's local time is the office time, as everywhere in
 * the app.
 */
export const toDateTimeInput = (ms: number): string => {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** The instant a `datetime-local` value names, or `null` when incomplete. */
export const fromDateTimeInput = (value: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hours, minutes] = match.map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};
