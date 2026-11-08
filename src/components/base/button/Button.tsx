'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import { Button as HeroUIButton, Spinner } from '@heroui/react';
import { Icon } from '@/icons';
import { IButtonProps } from './interface';
import {
  buttonCommonStyles,
  buttonFullWidthStyles,
  buttonSizeStyles,
  buttonVariantStyles,
  heroUIButtonVariant,
} from './classes';

/** Icon edge per button size. */
const ICON_SIZE = { sm: 16, md: 20, lg: 20 } as const;

/**
 * Labelled action button — HeroUI `Button` (press handling across touch,
 * mouse and keyboard, `aria-busy` while loading) in the neumorphic style.
 *
 * @example
 * <Button variant="primary" startIcon="scan-face" isFullWidth onPress={checkIn}>
 *   شبیه‌سازی ورود
 * </Button>
 */
export const Button: FC<IButtonProps> = ({
  children,
  variant = `primary`,
  size = `md`,
  startIcon,
  endIcon,
  isLoading = false,
  isFullWidth = false,
  ...rest
}) => (
  <HeroUIButton
    variant={heroUIButtonVariant[variant]}
    isPending={isLoading}
    className={clsx(
      buttonVariantStyles[variant],
      buttonSizeStyles[size],
      isFullWidth && buttonFullWidthStyles,
      buttonCommonStyles,
    )}
    {...rest}
  >
    {(renderProps) => (
      <>
        {isLoading ? (
          <Spinner color="current" size="sm" />
        ) : (
          startIcon && <Icon name={startIcon} size={ICON_SIZE[size]} />
        )}
        {typeof children === `function` ? children(renderProps) : children}
        {endIcon && <Icon name={endIcon} size={ICON_SIZE[size]} />}
      </>
    )}
  </HeroUIButton>
);

Button.displayName = `Button`;

export default Button;
