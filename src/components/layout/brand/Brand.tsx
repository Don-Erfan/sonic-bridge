import React, { FC } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config';
import { LogoMark, LogoWordmark } from '@/icons';
import { IBrandProps } from './interface';

/**
 * Ozone logo (mark + wordmark) linking home. The link's accessible name is
 * the product name; the artwork itself is decorative.
 *
 * @example
 * <Brand size={30} />
 */
export const Brand: FC<IBrandProps> = ({ size = 30, isMarkOnly = false }) => (
  <Link
    href="/"
    aria-label={siteConfig.name}
    className="inline-flex items-center gap-2.5 rounded-16 p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  >
    <LogoMark size={size} />
    {!isMarkOnly && (
      // The wordmark is Latin; keep it left-to-right inside the RTL layout.
      <span dir="ltr" className="text-fg-primary">
        <LogoWordmark size={Math.round(size * 0.5)} />
      </span>
    )}
  </Link>
);

Brand.displayName = `Brand`;

export default Brand;
