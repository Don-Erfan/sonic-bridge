import type { ButtonProps as HeroUIButtonProps } from '@heroui/react';
import { TIconName } from '@/icons';

export interface IButtonProps extends Omit<
  HeroUIButtonProps,
  `className` | `style` | `variant` | `size` | `isIconOnly` | `isPending`
> {
  variant?: TButtonVariant;
  size?: TButtonSize;
  /** Icon before the label (inline-start). */
  startIcon?: TIconName;
  /** Icon after the label (inline-end). */
  endIcon?: TIconName;
  /** Shows a spinner in place of `startIcon` and blocks presses. */
  isLoading?: boolean;
  /** Stretches to the container width (mobile primary actions). */
  isFullWidth?: boolean;
}

/**
 * `primary` brand gradient (one per screen) · `secondary` raised soft button ·
 * `ghost` text-only · `danger` destructive.
 */
export type TButtonVariant = `primary` | `secondary` | `ghost` | `danger`;

/** `sm` 36px · `md` 44px (minimum touch target) · `lg` 52px. */
export type TButtonSize = `sm` | `md` | `lg`;
