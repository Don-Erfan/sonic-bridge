import type { ReactNode } from 'react';

export interface ISheetProps {
  title: ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
  /** Sticky action area (usually the primary `Button`). */
  footer?: ReactNode;
  /** Close on backdrop tap, Escape and swipe-down. Defaults to `true`. */
  isDismissable?: boolean;
  /** Accessible name of the close button. */
  closeLabel?: string;
}
