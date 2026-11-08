import moment from 'jalali-moment';
import {
  CalendarDateTime,
  type DateValue,
  PersianCalendar,
  Time,
  toCalendar,
  toCalendarDateTime,
} from '@internationalized/date';
import { localizeDigits } from '../utils';

/**
 * Jalali (Solar Hijri) date handling, backed by `jalali-moment`.
 *
 * The API speaks Unix milliseconds; React Aria's date pickers speak
 * `@internationalized/date` values. These helpers convert between the two
 * through `jalali-moment`, in the browser's local time zone — the office
 * time, as everywhere else in the app.
 *
 * `jalali-moment`'s global locale is never changed: parsing passes the
 * calendar explicitly (`moment.from(…, 'fa', …)`) and formatting sets the
 * locale on its own instance only.
 */

/** React Aria's Persian calendar, shared (it holds no state). */
const persianCalendar = new PersianCalendar();

/** Era of every Solar Hijri year the app deals with (`Anno Persico`). */
const PERSIAN_ERA = `AP`;

/**
 * Locale for React Aria / HeroUI date components: Persian text and digits on
 * the Solar Hijri calendar, whatever the browser's default calendar is.
 */
export const JALALI_LOCALE = `fa-IR-u-ca-persian`;

const pad = (value: number) => String(value).padStart(2, `0`);

/**
 * The instant `ms` as a Jalali date and time (minute precision) for a
 * React Aria date picker.
 *
 * @example toJalaliDateTime(Date.parse('2026-11-08T14:30')) // ۱۴۰۵/۰۸/۱۷ ۱۴:۳۰
 */
export const toJalaliDateTime = (ms: number): CalendarDateTime => {
  const instant = moment(ms);
  return new CalendarDateTime(
    persianCalendar,
    PERSIAN_ERA,
    instant.jYear(),
    instant.jMonth() + 1,
    instant.jDate(),
    instant.hours(),
    instant.minutes(),
  );
};

/**
 * The instant a picked date names (seconds dropped), or `null` when there
 * is none or it is not a real local time. A value in another calendar is
 * converted to Jalali first, so callers may pass whatever the picker returns.
 */
export const fromJalaliDateTime = (
  value: DateValue | null | undefined,
): number | null => {
  if (!value) return null;
  const jalali = toCalendar(toCalendarDateTime(value), persianCalendar);
  const text = `${jalali.year}/${pad(jalali.month)}/${pad(jalali.day)} ${pad(jalali.hour)}:${pad(jalali.minute)}`;
  const instant = moment.from(text, `fa`, `YYYY/MM/DD HH:mm`);
  return instant.isValid() ? instant.valueOf() : null;
};

/**
 * A Jalali date and time in words, with Persian digits:
 * `یک‌شنبه ۱۷ آبان ۱۴۰۵، ساعت ۱۴:۳۰`.
 */
export const formatJalaliDateTime = (ms: number): string =>
  localizeDigits(
    moment(ms).locale(`fa`).format(`dddd D MMMM YYYY، [ساعت] HH:mm`),
  );

/** The local time of day of `ms` (minute precision), for a time field. */
export const toLocalTime = (ms: number): Time => {
  const instant = moment(ms);
  return new Time(instant.hours(), instant.minutes());
};

/** `ms` moved to `hour:minute` (local time) on the same day. */
export const withLocalTime = (
  ms: number,
  hour: number,
  minute: number,
): number =>
  moment(ms).hours(hour).minutes(minute).seconds(0).milliseconds(0).valueOf();
