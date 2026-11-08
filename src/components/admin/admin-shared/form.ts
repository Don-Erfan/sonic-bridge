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
