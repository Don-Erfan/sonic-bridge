import { ISiteConfig } from './interface';

/**
 * Static application metadata and locale settings.
 *
 * `locale` feeds React Aria's `I18nProvider` (Persian digits and the Solar
 * Hijri calendar through `Intl`), `<html lang>` and every formatter in
 * `@/lib/utils`; `direction` feeds `<html dir>`.
 */
export const siteConfig = {
  name: `اوزون | پنل کارکنان`,
  shortName: `اوزون`,
  description: `حضور و غیاب، اتاق‌های جلسه، رویدادها، حال‌وهوا و فروشگاه سکه‌های کارکنان اوزون.`,
  locale: `fa-IR`,
  direction: `rtl`,
  themeColor: { light: `#eceef6`, dark: `#161f33` },
} as const satisfies ISiteConfig;
