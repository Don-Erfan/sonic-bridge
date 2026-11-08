export interface IProductVisualProps {
  /** API media path or absolute URL; `null` shows the emoji. */
  imageUrl: string | null;
  emoji: string;
  /** Emoji size class, e.g. `text-5xl`. */
  emojiClassName?: string;
  className?: string;
}
