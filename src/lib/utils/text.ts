/**
 * Up to two initials taken from the first two words of a name. Works for any
 * script (Persian, Latin…); Latin letters are upper-cased.
 *
 * @example
 * getInitials(`سارا احمدی`); // "سا"
 */
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? ``)
    .join(``)
    .toLocaleUpperCase();

/** Persian (۰–۹) and Arabic-Indic (٠–٩) digits. */
const LOCALIZED_DIGITS = /[۰-۹٠-٩]/g;
const PERSIAN_ZERO = 0x06f0;
const ARABIC_ZERO = 0x0660;

/** Converts Persian / Arabic-Indic digits to ASCII: `۱۲` → `12`. */
export const normalizeDigits = (value: string): string =>
  value.replace(LOCALIZED_DIGITS, (digit) => {
    const code = digit.charCodeAt(0);
    return String(
      code >= PERSIAN_ZERO ? code - PERSIAN_ZERO : code - ARABIC_ZERO,
    );
  });

/** Zero-width non-joiner / joiner and the Arabic tatweel. */
const INVISIBLE_JOINERS = /\u200c|\u200d|\u0640/g;

/**
 * Canonical form for search: Arabic `ي` / `ك` → Persian `ی` / `ک`, joiners
 * removed, digits in ASCII, whitespace collapsed, case folded. Lets
 * "علی‌رضا", "علیرضا" and "علي رضا" find each other.
 */
export const normalizeForSearch = (value: string): string =>
  normalizeDigits(value)
    .replace(/ي/g, `ی`)
    .replace(/ك/g, `ک`)
    .replace(/[ةه]/g, `ه`)
    .replace(INVISIBLE_JOINERS, ``)
    .replace(/\s+/g, ``)
    .toLocaleLowerCase();

/** Length in user-perceived characters (emoji and combining marks count once). */
export const countCharacters = (value: string): number =>
  Array.from(value).length;

/** Cuts a string to `max` characters without splitting a surrogate pair. */
export const truncateCharacters = (value: string, max: number): string =>
  Array.from(value).slice(0, max).join(``);
