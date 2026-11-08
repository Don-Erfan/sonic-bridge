import { addMinutes, endOfDay } from '../utils';
import {
  IMoodDefinition,
  TAvailability,
  TMoodExpiry,
  TMoodKey,
} from './interface';

/**
 * Longest status note, in characters — Mattermost's own custom-status limit
 * (`CustomStatusTextMaxRunes = 100`), so the note syncs without truncation.
 */
export const MOOD_NOTE_MAX_LENGTH = 100;

/** Mood registry (Flyweight): shared, immutable definitions. */
export const moodRegistry: Record<TMoodKey, IMoodDefinition> = {
  great: {
    key: `great`,
    emoji: `😄`,
    mattermostEmoji: `smile`,
    tone: `success`,
    suggestedAvailability: `available`,
  },
  good: {
    key: `good`,
    emoji: `🙂`,
    mattermostEmoji: `slightly_smiling_face`,
    tone: `success`,
    suggestedAvailability: `available`,
  },
  focused: {
    key: `focused`,
    emoji: `🎧`,
    mattermostEmoji: `headphones`,
    tone: `primary`,
    suggestedAvailability: `busy`,
  },
  okay: {
    key: `okay`,
    emoji: `😐`,
    mattermostEmoji: `neutral_face`,
    tone: `neutral`,
    suggestedAvailability: `available`,
  },
  tired: {
    key: `tired`,
    emoji: `😪`,
    mattermostEmoji: `sleepy`,
    tone: `warning`,
    suggestedAvailability: `available`,
  },
  stressed: {
    key: `stressed`,
    emoji: `😓`,
    mattermostEmoji: `sweat`,
    tone: `danger`,
    suggestedAvailability: `busy`,
  },
  sick: {
    key: `sick`,
    emoji: `🤒`,
    mattermostEmoji: `face_with_thermometer`,
    tone: `danger`,
    suggestedAvailability: `away`,
  },
  celebrating: {
    key: `celebrating`,
    emoji: `🎉`,
    mattermostEmoji: `tada`,
    tone: `info`,
    suggestedAvailability: `available`,
  },
};

/** Picker order. */
export const MOOD_KEYS = Object.keys(moodRegistry) as readonly TMoodKey[];

export const AVAILABILITIES: readonly TAvailability[] = [
  `available`,
  `away`,
  `busy`,
];

export const MOOD_EXPIRIES: readonly TMoodExpiry[] = [
  `30m`,
  `1h`,
  `4h`,
  `today`,
  `never`,
];

export const isMoodKey = (value: unknown): value is TMoodKey =>
  typeof value === `string` && value in moodRegistry;

export const isAvailability = (value: unknown): value is TAvailability =>
  AVAILABILITIES.includes(value as TAvailability);

/**
 * Expiry strategies: each option knows how to turn "now" into an absolute
 * expiry (`null` = never). The absolute time is what both the API and
 * Mattermost store, so the client and the server agree on it.
 */
export const moodExpiryStrategies: Record<
  TMoodExpiry,
  (now: Date) => Date | null
> = {
  '30m': (now) => addMinutes(now, 30),
  '1h': (now) => addMinutes(now, 60),
  '4h': (now) => addMinutes(now, 240),
  today: (now) => endOfDay(now),
  never: () => null,
};

/** Whether a stored mood is still in effect at `now`. */
export const isMoodActive = (
  mood: { expiresAt: number | null } | null | undefined,
  now: Date,
): boolean => {
  if (!mood) return false;
  return mood.expiresAt === null || new Date(mood.expiresAt) > now;
};
