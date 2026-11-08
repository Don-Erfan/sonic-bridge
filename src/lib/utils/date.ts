/** Calendar arithmetic on *local* time (the office's clock). */

export const MINUTE_MS = 60_000;
export const DAY_MS = 86_400_000;

const pad = (value: number): string => String(value).padStart(2, `0`);

/**
 * Stable key of a local calendar day, `YYYY-MM-DD` in ASCII digits. Used to
 * enforce "once per day" rules (the daily coin reward) and to group lists.
 */
export const toDayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Last millisecond of the local day. */
export const endOfDay = (date: Date): Date =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );

export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * MINUTE_MS);

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Whole minutes from `from` to `to` (negative when `to` is earlier). */
export const minutesBetween = (from: Date, to: Date): number =>
  Math.floor((to.getTime() - from.getTime()) / MINUTE_MS);

/** Whole local calendar days from `from` to `to`. */
export const calendarDaysBetween = (from: Date, to: Date): number =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);

export const isSameDay = (a: Date, b: Date): boolean =>
  toDayKey(a) === toDayKey(b);

/** Half-open interval overlap: `[aStart, aEnd)` ∩ `[bStart, bEnd)` ≠ ∅. */
export const intervalsOverlap = (
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean => aStart < bEnd && bStart < aEnd;
