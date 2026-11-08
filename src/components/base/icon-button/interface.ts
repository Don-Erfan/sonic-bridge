import type { ButtonProps as HeroUIButtonProps } from '@heroui/react';
import { TIconName } from '@/icons';

export interface IIconButtonProps extends Omit<
  HeroUIButtonProps,
  | `children`
  | `className`
  | `style`
  | `variant`
  | `size`
  | `isIconOnly`
  | `isPending`
  | `aria-label`
> {
  icon: TIconName;
  /** Required: an icon-only button has no visible text. */
  'aria-label': string;
  variant?: TIconButtonVariant;
  size?: TIconButtonSize;
  /** `circle` for floating controls, `rounded` inside toolbars. */
  shape?: `circle` | `rounded`;
  isLoading?: boolean;
  /** Flips the glyph in RTL (directional arrows / chevrons). */
  isDirectional?: boolean;
}

export type TIconButtonVariant = `raised` | `ghost` | `primary`;

/** `sm` 36px · `md` 44px (touch target). */
export type TIconButtonSize = `sm` | `md`;
