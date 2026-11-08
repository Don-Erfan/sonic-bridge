import type { TAvailability } from '../mood';
import { MOOD_NOTE_MAX_LENGTH } from '../mood';
import { truncateCharacters } from '../utils';
import { IMattermostStatusPlan, TMattermostStatus } from './interface';

/** Ozone availability → Mattermost presence. */
export const availabilityToMattermost: Record<
  TAvailability,
  TMattermostStatus
> = {
  available: `online`,
  away: `away`,
  busy: `dnd`,
};

/** Mattermost's default custom-status emoji. */
export const DEFAULT_MATTERMOST_EMOJI = `speech_balloon`;

/**
 * Builder for the two Mattermost calls that mirror a mood. Validation and
 * Mattermost's quirks (100-rune text, `date_and_time` + absolute expiry,
 * `dnd_end_time` in Unix seconds, only for DND) live in `build()`, so callers
 * read as a plain description of the status.
 *
 * @example
 * const plan = new MattermostStatusBuilder()
 *   .forUser(`8k3j…`)
 *   .withEmoji(`headphones`)
 *   .withText(`روی ریلیز تمرکز کرده‌ام`)
 *   .withAvailability(`busy`)
 *   .expiringAt(new Date(`2026-10-31T16:00:00Z`))
 *   .build();
 */
export class MattermostStatusBuilder {
  private userId = ``;
  private emoji = DEFAULT_MATTERMOST_EMOJI;
  private text = ``;
  private availability: TAvailability = `available`;
  private expiresAt: Date | null = null;

  forUser(userId: string): this {
    this.userId = userId.trim();
    return this;
  }

  withEmoji(emoji: string): this {
    this.emoji = emoji.trim() || DEFAULT_MATTERMOST_EMOJI;
    return this;
  }

  withText(text: string): this {
    this.text = text.trim();
    return this;
  }

  withAvailability(availability: TAvailability): this {
    this.availability = availability;
    return this;
  }

  expiringAt(expiresAt: Date | null): this {
    this.expiresAt = expiresAt;
    return this;
  }

  build(): IMattermostStatusPlan {
    if (!this.userId) {
      throw new Error(`MattermostStatusBuilder: a user id is required`);
    }
    if (this.expiresAt && Number.isNaN(this.expiresAt.getTime())) {
      throw new Error(`MattermostStatusBuilder: invalid expiry date`);
    }

    const status = availabilityToMattermost[this.availability];
    const expiry = this.expiresAt;

    return {
      userId: this.userId,
      customStatus: {
        emoji: this.emoji,
        text: truncateCharacters(this.text, MOOD_NOTE_MAX_LENGTH),
        ...(expiry && {
          duration: `date_and_time` as const,
          expires_at: expiry.toISOString(),
        }),
      },
      status: {
        user_id: this.userId,
        status,
        ...(status === `dnd` &&
          expiry && { dnd_end_time: Math.floor(expiry.getTime() / 1000) }),
      },
    };
  }
}
