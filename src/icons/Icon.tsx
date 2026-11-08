import React, { FC } from 'react';
import clsx from 'clsx';
import { IIconProps } from './interface';
import { iconRegistry } from './registry';

const DEFAULT_VIEWBOX = 24;

/**
 * Renders a glyph from the shared icon registry (Flyweight): path data is
 * stored once, while size, stroke and colour are supplied per instance.
 * Paints with `currentColor`, so a `text-*` utility on the icon or any parent
 * colours it. Size is applied inline so it wins over HeroUI's slot sizing
 * inside buttons.
 *
 * @example
 * <Icon name="coin" size={20} className="text-coin" />
 */
export const Icon: FC<IIconProps> = ({
  name,
  size = 24,
  strokeWidth = 1.75,
  className,
  title,
}) => {
  const { viewBox = DEFAULT_VIEWBOX, paths } = iconRegistry[name];

  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      fill="none"
      className={clsx(`shrink-0`, className)}
      aria-hidden={title ? undefined : true}
      role={title ? `img` : undefined}
      focusable={false}
    >
      {title ? <title>{title}</title> : null}
      {paths.map(({ d, variant = `stroke` }) =>
        variant === `fill` ? (
          <path key={d} d={d} fill="currentColor" />
        ) : (
          <path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
};

Icon.displayName = `Icon`;

export default Icon;
