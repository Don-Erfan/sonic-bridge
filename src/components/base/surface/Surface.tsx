import React, { FC } from 'react';
import clsx from 'clsx';
import { ISurfaceProps } from './interface';
import {
  surfaceBaseStyles,
  surfaceElevationStyles,
  surfacePaddingStyles,
  surfaceVariantStyles,
} from './classes';

/**
 * The neumorphic panel every card is built on: same colour as the page,
 * depth from a highlight/shade shadow pair (raised) or the reverse pair
 * (inset).
 *
 * @example
 * <Surface as="section" padding="lg" aria-labelledby="check-in-title">…</Surface>
 * <Surface variant="inset" padding="md">بدون رزرو</Surface>
 */
export const Surface: FC<ISurfaceProps> = ({
  children,
  variant = `raised`,
  elevation = `md`,
  padding = `md`,
  as: Element = `div`,
  className,
  ...aria
}) => (
  <Element
    className={clsx(
      surfaceBaseStyles,
      surfaceVariantStyles[variant],
      variant === `raised` && surfaceElevationStyles[elevation],
      surfacePaddingStyles[padding],
      className,
    )}
    {...aria}
  >
    {children}
  </Element>
);

Surface.displayName = `Surface`;

export default Surface;
