import React, { FC } from 'react';
import { IIllustrationProps } from './interface';
import { LOGO_RINGS } from './logo-paths';

/**
 * The Ozone mark: three interlocking rings in the brand purple, blue and
 * teal (from ozone.ir/logo.svg). Decorative — pair it with visible text or
 * label its container.
 *
 * @example
 * <LogoMark size={32} />
 */
export const LogoMark: FC<IIllustrationProps> = ({ size = 32, className }) => (
  <svg
    width={size}
    height={size}
    style={{ width: size, height: size }}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    aria-hidden
    focusable={false}
  >
    {LOGO_RINGS.map(({ name, color, d }) => (
      <path key={name} d={d} fill={color} />
    ))}
  </svg>
);

LogoMark.displayName = `LogoMark`;

export default LogoMark;
