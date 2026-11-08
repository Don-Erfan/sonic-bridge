import type { TIconName } from '@/icons';

/** Shape of the static site configuration in `./site`. */
export interface ISiteConfig {
  /** Full product name (install dialog, page titles). */
  name: string;
  /** Home-screen label: at most ~12 characters. */
  shortName: string;
  description: string;
  /** BCP 47 language tag, e.g. `en-US` or `fa-IR`. */
  locale: string;
  direction: TDirection;
  /** Browser / OS chrome colour per theme (matches the neumorphic base). */
  themeColor: { light: string; dark: string };
}

/** Text direction written to `<html dir>`. */
export type TDirection = `ltr` | `rtl`;

/** One destination of the app navigation (tab bar and side rail). */
export interface INavItem {
  href: string;
  label: string;
  icon: TIconName;
  /**
   * `exact` matches only `href` itself (home); `prefix` also matches nested
   * routes, so `/store/orders` keeps the store tab active.
   */
  match: `exact` | `prefix`;
}
