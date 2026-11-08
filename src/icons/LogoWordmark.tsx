import React, { FC } from 'react';
import { IIllustrationProps } from './interface';
import { LOGO_WORDMARK } from './logo-paths';

/** Box of the wordmark inside the original 128×32 logo. */
const VIEW_BOX = { x: 45, y: 5, width: 83.5, height: 22 };

/**
 * The "OZONE" wordmark, painted with `currentColor` so it reads on both
 * themes. `size` is the height; the width keeps the artwork's ratio.
 *
 * @example
 * <LogoWordmark size={16} className="text-fg-primary" />
 */
export const LogoWordmark: FC<IIllustrationProps> = ({
  size = 16,
  className,
}) => {
  const width = (size * VIEW_BOX.width) / VIEW_BOX.height;

  return (
    <svg
      width={width}
      height={size}
      style={{ width, height: size }}
      viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
      fill="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      {LOGO_WORDMARK.map(({ d, isEvenOdd, opacity }) => (
        <path
          key={d}
          d={d}
          fill="currentColor"
          fillOpacity={opacity}
          fillRule={isEvenOdd ? `evenodd` : undefined}
          clipRule={isEvenOdd ? `evenodd` : undefined}
        />
      ))}
    </svg>
  );
};

LogoWordmark.displayName = `LogoWordmark`;

export default LogoWordmark;
