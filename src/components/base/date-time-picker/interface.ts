import type { ReactNode } from 'react';

export interface IDateTimePickerProps {
  /** Visible label. */
  label: string;
  /** The picked instant (Unix milliseconds), or `null` for none yet. */
  value: number | null;
  /**
   * Called with each new complete instant. While a segment is cleared the
   * value stays the last complete one; see `onIncompleteChange`.
   */
  onChange: (value: number | null) => void;
  /**
   * Whether the field shows an unfinished date (a segment empty). A form
   * should refuse to submit then: `value` is still the last complete date.
   */
  onIncompleteChange?: (isIncomplete: boolean) => void;
  /**
   * Helper text under the field. Defaults to the picked date in words
   * (`یک‌شنبه ۱۷ آبان ۱۴۰۵، ساعت ۱۴:۳۰`).
   */
  description?: ReactNode;
  /** Shown under the field while `isInvalid`. */
  errorMessage?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
}
