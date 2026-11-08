import { INavItem } from './interface';
import { uiText } from './ui-text';

/**
 * Primary destinations, in tab-bar order (start → end). Five tabs is the
 * mobile maximum that keeps every label legible at 360px; wallet and profile
 * are reached from the header.
 */
export const primaryNavigation: readonly INavItem[] = [
  { href: `/`, label: uiText.nav.home, icon: `home`, match: `exact` },
  { href: `/team`, label: uiText.nav.team, icon: `users`, match: `prefix` },
  { href: `/rooms`, label: uiText.nav.rooms, icon: `door`, match: `prefix` },
  {
    href: `/events`,
    label: uiText.nav.events,
    icon: `calendar`,
    match: `prefix`,
  },
  { href: `/store`, label: uiText.nav.store, icon: `bag`, match: `prefix` },
];

/** Secondary destinations, shown in the desktop side rail only. */
export const secondaryNavigation: readonly INavItem[] = [
  {
    href: `/wallet`,
    label: uiText.nav.wallet,
    icon: `wallet`,
    match: `prefix`,
  },
  {
    href: `/profile`,
    label: uiText.nav.profile,
    icon: `user`,
    match: `prefix`,
  },
];

/** The administration panel, listed for administrators only. */
export const adminNavigationItem: INavItem = {
  href: `/admin`,
  label: uiText.nav.admin,
  icon: `shield`,
  match: `prefix`,
};

/** Whether `pathname` belongs to `item` (drives `aria-current`). */
export const isNavItemActive = (item: INavItem, pathname: string): boolean =>
  item.match === `exact`
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
