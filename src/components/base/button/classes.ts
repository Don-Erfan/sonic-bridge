import type { ButtonProps as HeroUIButtonProps } from '@heroui/react';
import { TButtonSize, TButtonVariant } from './interface';

/**
 * Colours are fed into HeroUI's own button tokens (`--button-bg`,
 * `--button-fg`, …) so HeroUI keeps driving the hover / pressed state
 * machine; depth comes from the neumorphic shadows. Pressing swaps the
 * raised shadow for an inset one — the soft-UI "push".
 */
export const buttonVariantStyles: Record<TButtonVariant, string> = {
  primary: `bg-action-gradient text-white [--button-bg:transparent] [--button-bg-hover:transparent] [--button-bg-pressed:transparent] [--button-fg:#fff] shadow-[0_10px_20px_-8px_rgb(115_45_246/0.6)] data-hovered:brightness-110 data-pressed:shadow-[inset_0_3px_8px_rgb(0_0_0/0.3)]`,
  secondary: `bg-neu text-accent-fg [--button-bg:var(--neu-base)] [--button-bg-hover:var(--neu-base)] [--button-bg-pressed:var(--neu-base)] [--button-fg:var(--accent-fg)] shadow-neu-sm data-pressed:shadow-neu-pressed`,
  ghost: `bg-transparent text-accent-fg [--button-bg:transparent] [--button-bg-hover:var(--default-200)] [--button-bg-pressed:var(--default-300)] [--button-fg:var(--accent-fg)] shadow-none`,
  danger: `text-white [--button-bg:var(--danger-500)] [--button-bg-hover:var(--danger-600)] [--button-bg-pressed:var(--danger-700)] [--button-fg:#fff] shadow-[0_10px_20px_-8px_rgb(229_36_94/0.55)] data-pressed:shadow-[inset_0_3px_8px_rgb(0_0_0/0.3)]`,
};

export const buttonSizeStyles: Record<TButtonSize, string> = {
  sm: `h-9 gap-1.5 px-4 typo-s2 rounded-12`,
  md: `h-11 gap-2 px-5 typo-s1 rounded-16`,
  lg: `h-13 gap-2 px-6 typo-s1 rounded-16`,
};

/** The HeroUI variant each type builds on. */
export const heroUIButtonVariant: Record<
  TButtonVariant,
  NonNullable<HeroUIButtonProps[`variant`]>
> = {
  primary: `primary`,
  secondary: `secondary`,
  ghost: `ghost`,
  danger: `danger`,
};

/**
 * Shared overrides: no press-scale (the shadow carries the press), visible
 * focus ring, disabled = flattened and faded (never shadow-only).
 */
export const buttonCommonStyles = `border border-neu-outline font-medium transition-[box-shadow,filter,background-color] duration-200 data-pressed:transform-none data-focus-visible:ring-2 data-focus-visible:ring-primary-500 data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-neu data-disabled:opacity-45 data-disabled:shadow-none data-disabled:brightness-100 [&_svg]:m-0`;

export const buttonFullWidthStyles = `w-full`;
