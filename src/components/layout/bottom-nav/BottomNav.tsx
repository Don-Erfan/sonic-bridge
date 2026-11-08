'use client';
import React, { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavItemActive, primaryNavigation, uiText } from '@/config';
import { Icon } from '@/icons';
import { IBottomNavProps } from './interface';
import {
  bottomNavBarStyles,
  bottomNavIconStyles,
  bottomNavLabelStyles,
  bottomNavLinkStyles,
  bottomNavRootStyles,
} from './classes';

/**
 * Mobile tab bar: the five primary destinations in thumb reach, each with
 * an icon *and* a label; the current page is marked with `aria-current`.
 *
 * @example
 * <BottomNav />
 */
export const BottomNav: FC<IBottomNavProps> = ({
  items = primaryNavigation,
}) => {
  const pathname = usePathname();

  return (
    <nav aria-label={uiText.nav.label} className={bottomNavRootStyles}>
      <ul className={bottomNavBarStyles}>
        {items.map((item) => {
          const isActive = isNavItemActive(item, pathname);
          return (
            <li key={item.href} className="h-full py-2">
              <Link
                href={item.href}
                aria-current={isActive ? `page` : undefined}
                className={bottomNavLinkStyles}
              >
                <span className={bottomNavIconStyles}>
                  <Icon name={item.icon} size={22} />
                </span>
                <span className={bottomNavLabelStyles}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

BottomNav.displayName = `BottomNav`;

export default BottomNav;
