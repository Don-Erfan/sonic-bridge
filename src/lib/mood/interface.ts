import type { TTone } from '../tone';

/** The moods a person can pick. */
export type TMoodKey =
  | `great`
  | `good`
  | `focused`
  | `okay`
  | `tired`
  | `stressed`
  | `sick`
  | `celebrating`;

/** How reachable the person is — mirrored to the Mattermost presence. */
export type TAvailability = `available` | `away` | `busy`;

/** When the status clears itself. */
export type TMoodExpiry = `30m` | `1h` | `4h` | `today` | `never`;

/** Intrinsic data of a mood (Flyweight registry entry). */
export interface IMoodDefinition {
  key: TMoodKey;
  /** Unicode emoji shown in the app. */
  emoji: string;
  /**
   * Mattermost emoji *name* (the `:name:` short code) for the custom status.
   * Must exist in Mattermost's built-in emoji set.
   */
  mattermostEmoji: string;
  tone: TTone;
  /** Availability pre-selected when this mood is picked. */
  suggestedAvailability: TAvailability;
}
