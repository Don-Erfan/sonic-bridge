import type { TTone } from '@/lib/tone';

export const statTileStyles = `flex min-w-0 flex-col items-start gap-2 rounded-24 border border-neu-outline bg-neu p-3.5 text-start shadow-neu-sm`;

export const statTileLinkStyles = `outline-none transition-shadow duration-200 active:shadow-neu-pressed focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neu`;

export const statTileIconStyles = `flex size-9 items-center justify-center rounded-full shadow-neu-inset-sm`;

export const statTileToneStyles: Record<TTone, string> = {
  primary: `text-primary-500`,
  info: `text-secondary-500`,
  success: `text-teal-600`,
  warning: `text-warning-600`,
  danger: `text-danger-500`,
  neutral: `text-fg-tertiary`,
};

export const statTileValueStyles = `typo-h2 tabular-nums text-fg-primary`;

export const statTileLabelStyles = `typo-b2 text-fg-tertiary`;
