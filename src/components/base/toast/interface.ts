import type { ReactNode } from 'react';

export interface IToasterProps {
  /** Where the stack is anchored. Defaults to `top` (clear of the tab bar). */
  placement?: TToastPlacement;
  maxVisibleToasts?: number;
}

export type TToastVariant = `danger` | `warning` | `info` | `success`;

export type TToastPlacement =
  `top` | `top start` | `top end` | `bottom` | `bottom start` | `bottom end`;

export interface INotifyOptions {
  description?: ReactNode;
  /** Auto-dismiss after this many ms; `0` keeps it open. Defaults to 4000. */
  timeout?: number;
  onClose?: () => void;
  /** One inline action (e.g. "Retry", "Update"). */
  action?: { label: string; onPress: () => void };
}

/** The notification Facade exposed to the app. */
export interface INotify {
  danger: (title: ReactNode, options?: INotifyOptions) => string;
  warning: (title: ReactNode, options?: INotifyOptions) => string;
  info: (title: ReactNode, options?: INotifyOptions) => string;
  success: (title: ReactNode, options?: INotifyOptions) => string;
  /** Danger toast with the API's message (or a fallback) as description. */
  error: (error: unknown, fallback?: string) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}
