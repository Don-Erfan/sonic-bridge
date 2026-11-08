import type { ReactNode } from 'react';
import type { TextFieldProps as HeroUITextFieldProps } from '@heroui/react';
import { TIconName } from '@/icons';

export interface ITextFieldProps extends Omit<
  HeroUITextFieldProps,
  `children` | `className` | `style`
> {
  /** Visible label. Omit it only together with `aria-label`. */
  label?: string;
  placeholder?: string;
  /** Helper text under the field. */
  description?: ReactNode;
  /** Message shown when `isInvalid` (or native validation fails). */
  errorMessage?: string;
  /** Glyph inside the field at the start edge. */
  startIcon?: TIconName;
  /** Trailing control inside the field (clear / show-password button). */
  endContent?: ReactNode;
  /** Renders a `<textarea>` instead of an `<input>`. */
  isMultiline?: boolean;
  /** Visible rows of a multiline field. */
  rows?: number;
  /** `autocomplete` hint. */
  autoComplete?: string;
  /** Mobile keyboards: `none` for usernames and codes. */
  autoCapitalize?: `none` | `sentences` | `words` | `characters`;
}
