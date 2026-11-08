import { siteConfig } from '@/config';
import { calendarDaysBetween } from './date';

/**
 * Locale-aware display formatters (Persian numerals and the Solar Hijri
 * calendar for `fa-IR`). Formatters are created once (Flyweight) — `Intl`
 * constructors are comparatively expensive and these run for every row.
 */
const { locale } = siteConfig;

const digitFormatter = new Intl.NumberFormat(locale, { useGrouping: false });
const numberFormatter = new Intl.NumberFormat(locale);
const signedFormatter = new Intl.NumberFormat(locale, {
  signDisplay: `exceptZero`,
});
const timeFormatter = new Intl.DateTimeFormat(locale, {
  hour: `2-digit`,
  minute: `2-digit`,
  hourCycle: `h23`,
});
const longDateFormatter = new Intl.DateTimeFormat(locale, {
  weekday: `long`,
  day: `numeric`,
  month: `long`,
});
const shortDateFormatter = new Intl.DateTimeFormat(locale, {
  day: `numeric`,
  month: `long`,
});
const relativeDayFormatter = new Intl.RelativeTimeFormat(locale, {
  numeric: `auto`,
});
const hourUnitFormatter = new Intl.NumberFormat(locale, {
  style: `unit`,
  unit: `hour`,
  unitDisplay: `long`,
});
const minuteUnitFormatter = new Intl.NumberFormat(locale, {
  style: `unit`,
  unit: `minute`,
  unitDisplay: `long`,
});
const listFormatter = new Intl.ListFormat(locale, { type: `conjunction` });

const ASCII_DIGIT = /\d/g;

/** Unix milliseconds (the API's form), a Date, or an ISO string. */
type TDateInput = number | string | Date;
const toDate = (value: TDateInput): Date =>
  value instanceof Date ? value : new Date(value);

/**
 * Renders ASCII digits in the locale's numerals, leaving every other
 * character untouched: `09:30` → `۰۹:۳۰`.
 */
export const localizeDigits = (value: string | number): string =>
  String(value).replace(ASCII_DIGIT, (digit) =>
    digitFormatter.format(Number(digit)),
  );

/**
 * An order's receipt number, ungrouped so it reads (and is typed back) as
 * one code: `1042` → `۱۰۴۲`.
 */
export const formatReceiptNumber = (value: number): string =>
  localizeDigits(value);

/** Grouped number: `12500` → `۱۲٬۵۰۰`. */
export const formatNumber = (value: number): string =>
  numberFormatter.format(value);

/** Ledger amount with an explicit sign: `+۱۰۰`, `‎−۲٬۰۰۰`. */
export const formatSignedNumber = (value: number): string =>
  signedFormatter.format(value);

/** 24-hour clock time: `۰۹:۳۰`. */
export const formatTime = (value: TDateInput): string =>
  timeFormatter.format(toDate(value));

/** `۰۹:۳۰ تا ۱۱:۰۰` */
export const formatTimeRange = (
  start: TDateInput,
  end: TDateInput,
  separator = `تا`,
): string => `${formatTime(start)} ${separator} ${formatTime(end)}`;

/** Weekday and date: `شنبه ۹ آبان`. */
export const formatLongDate = (value: TDateInput): string =>
  longDateFormatter.format(toDate(value));

/** Day and month: `۹ آبان`. */
export const formatShortDate = (value: TDateInput): string =>
  shortDateFormatter.format(toDate(value));

/**
 * `امروز` / `فردا` / `دیروز` for nearby days, the weekday and date otherwise.
 */
export const formatRelativeDay = (value: TDateInput, now: Date): string => {
  const days = calendarDaysBetween(now, toDate(value));
  return Math.abs(days) <= 1
    ? relativeDayFormatter.format(days, `day`)
    : formatLongDate(value);
};

/** Day + time for history rows: `امروز ۰۹:۳۰`, `۲ آبان ۱۴:۱۰`. */
export const formatDateTime = (value: TDateInput, now: Date): string => {
  const date = toDate(value);
  const days = calendarDaysBetween(now, date);
  const day =
    Math.abs(days) <= 1
      ? relativeDayFormatter.format(days, `day`)
      : formatShortDate(date);
  return `${day} ${formatTime(date)}`;
};

/** Duration in hours and minutes: `۴۵ دقیقه`, `۱ ساعت و ۳۰ دقیقه`. */
export const formatDuration = (totalMinutes: number): string => {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts = [
    hours > 0 && hourUnitFormatter.format(hours),
    (rest > 0 || hours === 0) && minuteUnitFormatter.format(rest),
  ].filter((part): part is string => Boolean(part));

  return listFormatter.format(parts);
};
