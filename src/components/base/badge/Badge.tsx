import React, { FC } from 'react';
import clsx from 'clsx';
import { Icon } from '@/icons';
import { IBadgeProps } from './interface';
import {
  badgeBaseStyles,
  badgeDotStyles,
  badgePulseStyles,
  badgeSizeStyles,
  badgeToneStyles,
} from './classes';

/**
 * Status pill. The meaning is always in the text; tone and dot only
 * reinforce it (never colour alone).
 *
 * @example
 * <Badge tone="success" hasDot>آزاد</Badge>
 */
export const Badge: FC<IBadgeProps> = ({
  children,
  tone = `neutral`,
  icon,
  hasDot = false,
  isPulsing = false,
  size = `sm`,
}) => (
  <span
    className={clsx(
      badgeBaseStyles,
      badgeSizeStyles[size],
      badgeToneStyles[tone],
    )}
  >
    {icon && <Icon name={icon} size={size === `sm` ? 12 : 14} />}
    {!icon && hasDot && (
      <span aria-hidden className={badgeDotStyles}>
        {isPulsing && <span className={badgePulseStyles} />}
      </span>
    )}
    {children}
  </span>
);

Badge.displayName = `Badge`;

export default Badge;
