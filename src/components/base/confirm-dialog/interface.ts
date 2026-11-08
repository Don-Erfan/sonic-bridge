import type { ReactNode } from 'react';

export interface IConfirmDialogProps {
  title: ReactNode;
  message: ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Runs on confirm. Return a promise to keep the dialog open with a loading
   * button until it settles; it closes on success and stays open on error.
   */
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` for destructive actions, `primary` otherwise. */
  tone?: `danger` | `primary`;
}
