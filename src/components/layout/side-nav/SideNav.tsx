'use client';
import React, { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  adminNavigationItem,
  INavItem,
  isNavItemActive,
  primaryNavigation,
  secondaryNavigation,
  uiText,
} from '@/config';
import { useProfile } from '@/hooks';
import { Icon } from '@/icons';
import { isAdmin } from '@/services';
import { Brand } from '../brand';
import { ISideNavProps } from './interface';
import {
  sideNavDividerStyles,
  sideNavLinkStyles,
  sideNavListStyles,
  sideNavPanelStyles,
  sideNavRootStyles,
} from './classes';

const NavList: FC<{ items: readonly INavItem[]; pathname: string }> = ({
  items,
  pathname,
}) => (
  <ul className={sideNavListStyles}>
    {items.map((item) => (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={isNavItemActive(item, pathname) ? `page` : undefined}
          className={sideNavLinkStyles}
        >
          <Icon name={item.icon} size={22} />
          {item.label}
        </Link>
      </li>
    ))}
  </ul>
);

/**
 * Desktop navigation rail (the tab bar's large-screen counterpart), with the
 * secondary destinations (wallet, profile and, for administrators, the
 * admin panel) below a divider.
 *
 * @example
 * <SideNav />
 */
export const SideNav: FC<ISideNavProps> = ({
  primary = primaryNavigation,
  secondary = secondaryNavigation,
}) => {
  const pathname = usePathname();
  const { data: profile } = useProfile();
  const secondaryItems = isAdmin(profile)
    ? [...secondary, adminNavigationItem]
    : secondary;

  return (
    <aside className={sideNavRootStyles}>
      <nav aria-label={uiText.nav.label} className={sideNavPanelStyles}>
        <Brand size={34} />
        <NavList items={primary} pathname={pathname} />
        <div aria-hidden className={sideNavDividerStyles} />
        <NavList items={secondaryItems} pathname={pathname} />
      </nav>
    </aside>
  );
};

SideNav.displayName = `SideNav`;

export default SideNav;
