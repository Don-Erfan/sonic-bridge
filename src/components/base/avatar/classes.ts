import type { TPresenceStatus } from '@/lib/presence';
import { TAvatarSize } from './interface';

export const avatarRootStyles = `relative inline-flex shrink-0`;

/** Raised neumorphic ring around the photo / initials. */
export const avatarFrameStyles = `rounded-full bg-neu p-[3px] shadow-neu-sm border border-neu-outline`;

export const avatarSizeStyles: Record<TAvatarSize, string> = {
  sm: `size-9`,
  md: `size-11`,
  lg: `size-14`,
  xl: `size-20`,
};

export const avatarFallbackTextStyles: Record<TAvatarSize, string> = {
  sm: `typo-c1 font-semibold`,
  md: `typo-s2 font-semibold`,
  lg: `typo-s1 font-semibold`,
  xl: `typo-h3`,
};

/**
 * Initials backgrounds, picked by a stable hash of the name so a person
 * always gets the same colour (Flyweight palette of brand tints).
 */
export const avatarPalette: readonly string[] = [
  `bg-primary-100 text-primary-700`,
  `bg-secondary-100 text-secondary-700`,
  `bg-teal-100 text-teal-800`,
  `bg-warning-100 text-warning-800`,
  `bg-danger-100 text-danger-700`,
];

export const avatarImageStyles = `size-full rounded-full object-cover`;

export const presenceDotStyles = `absolute bottom-0 end-0 rounded-full ring-2 ring-neu`;

export const presenceDotSizeStyles: Record<TAvatarSize, string> = {
  sm: `size-2.5`,
  md: `size-3`,
  lg: `size-3.5`,
  xl: `size-4`,
};

export const presenceDotToneStyles: Record<TPresenceStatus, string> = {
  'in-office': `bg-presence-in-office`,
  remote: `bg-presence-remote`,
  'on-leave': `bg-presence-on-leave`,
  out: `bg-presence-out`,
};

export const avatarEmojiStyles = `absolute -top-1 -end-1 flex size-6 items-center justify-center rounded-full bg-neu text-sm leading-none shadow-neu-sm`;
