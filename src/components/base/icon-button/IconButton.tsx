'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import { Button as HeroUIButton, Spinner } from '@heroui/react';
import { Icon } from '@/icons';
import { IIconButtonProps } from './interface';
import {
  iconButtonCommonStyles,
  iconButtonShapeStyles,
  iconButtonSizeStyles,
  iconButtonVariantStyles,
} from './classes';

const ICON_SIZE = { sm: 18, md: 22 } as const;

/**
 * Icon-only soft button (HeroUI `Button`, `isIconOnly`). The accessible name
 * is mandatory in its props.
 *
 * @example
 * <IconButton icon="close" aria-label="بستن" onPress={close} />
 */
export const IconButton: FC<IIconButtonProps> = ({
  icon,
  variant = `raised`,
  size = `md`,
  shape = `circle`,
  isLoading = false,
  isDirectional = false,
  ...rest
}) => (
  <HeroUIButton
    isIconOnly
    isPending={isLoading}
    variant={variant === `primary` ? `primary` : `tertiary`}
    className={clsx(
      iconButtonVariantStyles[variant],
      iconButtonSizeStyles[size],
      iconButtonShapeStyles[shape],
      iconButtonCommonStyles,
    )}
    {...rest}
  >
    {isLoading ? (
      <Spinner color="current" size="sm" />
    ) : (
      <Icon
        name={icon}
        size={ICON_SIZE[size]}
        className={clsx(isDirectional && `rtl:-scale-x-100`)}
      />
    )}
  </HeroUIButton>
);

IconButton.displayName = `IconButton`;

export default IconButton;
