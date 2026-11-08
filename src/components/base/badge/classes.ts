import type { TTone } from '@/lib/tone';

/** Tone → filled pill (text colours meet WCAG AA on their fills). */
export const badgeToneStyles: Record<TTone, string> = {
  primary: `bg-tone-primary text-tone-primary-fg`,
  info: `bg-tone-info text-tone-info-fg`,
  success: `bg-tone-success text-tone-success-fg`,
  warning: `bg-tone-warning text-tone-warning-fg`,
  danger: `bg-tone-danger text-tone-danger-fg`,
  neutral: `bg-tone-neutral text-tone-neutral-fg`,
};

export const badgeSizeStyles = {
  sm: `h-6 gap-1 px-2 typo-c1 font-medium`,
  md: `h-7 gap-1.5 px-2.5 typo-s2`,
} as const;

export const badgeBaseStyles = `inline-flex shrink-0 items-center rounded-full whitespace-nowrap`;

export const badgeDotStyles = `relative inline-flex size-2 rounded-full bg-current`;

export const badgePulseStyles = `absolute inset-0 animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none`;
