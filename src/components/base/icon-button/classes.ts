import { TIconButtonSize, TIconButtonVariant } from './interface';

export const iconButtonVariantStyles: Record<TIconButtonVariant, string> = {
  raised: `bg-neu text-fg-secondary [--button-bg:var(--neu-base)] [--button-bg-hover:var(--neu-base)] [--button-bg-pressed:var(--neu-base)] [--button-fg:var(--fg-secondary)] shadow-neu-sm data-hovered:text-accent-fg data-pressed:shadow-neu-pressed`,
  ghost: `bg-transparent text-fg-tertiary [--button-bg:transparent] [--button-bg-hover:transparent] [--button-bg-pressed:transparent] [--button-fg:var(--fg-tertiary)] shadow-none data-hovered:text-accent-fg data-pressed:shadow-neu-pressed`,
  primary: `bg-action-gradient text-white [--button-bg:transparent] [--button-bg-hover:transparent] [--button-bg-pressed:transparent] [--button-fg:#fff] shadow-[0_8px_16px_-6px_rgb(115_45_246/0.6)] data-pressed:shadow-[inset_0_3px_8px_rgb(0_0_0/0.3)]`,
};

export const iconButtonSizeStyles: Record<TIconButtonSize, string> = {
  sm: `size-9 min-w-9`,
  md: `size-11 min-w-11`,
};

export const iconButtonShapeStyles = {
  circle: `rounded-full`,
  rounded: `rounded-16`,
} as const;

export const iconButtonCommonStyles = `border border-neu-outline p-0 transition-[box-shadow,color] duration-200 data-pressed:transform-none data-focus-visible:ring-2 data-focus-visible:ring-primary-500 data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-neu data-disabled:opacity-45 data-disabled:shadow-none [&_svg]:m-0`;
