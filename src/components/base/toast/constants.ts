import type { ToastContentValue } from '@heroui/react';
import { TIconName } from '@/icons';
import { TToastVariant } from './interface';

/** Fits a 360px phone with 16px gutters, caps at 420px elsewhere. */
export const TOAST_WIDTH = `min(calc(100vw - 2rem), 420px)`;

export const TOAST_GAP = 8;

/** HeroUI variants → app variants (`default` / `accent` are informational). */
export const toastVariantFromHeroUI: Record<
  NonNullable<ToastContentValue[`variant`]>,
  TToastVariant
> = {
  default: `info`,
  accent: `info`,
  success: `success`,
  warning: `warning`,
  danger: `danger`,
};

export const toastIcon: Record<TToastVariant, TIconName> = {
  success: `check-circle`,
  danger: `alert`,
  warning: `alert`,
  info: `info`,
};
