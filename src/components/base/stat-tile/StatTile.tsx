import React, { FC } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Icon } from '@/icons';
import { IStatTileProps } from './interface';
import {
  statTileIconStyles,
  statTileLabelStyles,
  statTileLinkStyles,
  statTileStyles,
  statTileToneStyles,
  statTileValueStyles,
} from './classes';

/**
 * Compact metric tile (icon, figure, label); a link when `href` is set.
 *
 * @example
 * <StatTile icon="users" tone="success" value="۹" label="در دفتر" href="/team" />
 */
export const StatTile: FC<IStatTileProps> = ({
  icon,
  tone,
  value,
  label,
  href,
}) => {
  const content = (
    <>
      <span className={clsx(statTileIconStyles, statTileToneStyles[tone])}>
        <Icon name={icon} size={18} />
      </span>
      <span className={statTileValueStyles}>{value}</span>
      <span className={statTileLabelStyles}>{label}</span>
    </>
  );

  return href ? (
    <Link href={href} className={clsx(statTileStyles, statTileLinkStyles)}>
      {content}
    </Link>
  ) : (
    <div className={statTileStyles}>{content}</div>
  );
};

StatTile.displayName = `StatTile`;

export default StatTile;
