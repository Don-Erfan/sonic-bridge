/** Every glyph available in the icon registry. */
export type TIconName =
  | `alert`
  | `bag`
  | `book`
  | `building`
  | `calendar`
  | `camera`
  | `calendar-off`
  | `check`
  | `check-circle`
  | `chevron-left`
  | `chevron-right`
  | `clock`
  | `close`
  | `coffee`
  | `coin`
  | `door`
  | `download`
  | `edit`
  | `eye`
  | `eye-off`
  | `gift`
  | `home`
  | `image`
  | `info`
  | `laptop`
  | `lock`
  | `logout`
  | `map-pin`
  | `megaphone`
  | `message`
  | `minus`
  | `monitor`
  | `moon`
  | `plus`
  | `presentation`
  | `receipt`
  | `refresh`
  | `scan-face`
  | `search`
  | `share`
  | `shield`
  | `shirt`
  | `smile`
  | `sparkles`
  | `speaker`
  | `sun`
  | `trash`
  | `user`
  | `users`
  | `video`
  | `wallet`
  | `whiteboard`
  | `wifi-off`;

/** How a path is painted: outlined with the icon stroke, or filled. */
export type TIconPathVariant = `stroke` | `fill`;

/** One `<path>` of an icon. */
export interface IIconPath {
  d: string;
  /** Defaults to `stroke`. */
  variant?: TIconPathVariant;
}

/** Intrinsic (shared) state of an icon — see `registry.ts`. */
export interface IIconDefinition {
  /** Square viewBox edge. Defaults to 24. */
  viewBox?: number;
  paths: readonly IIconPath[];
}

export interface IIconProps {
  name: TIconName;
  /** Rendered edge length in px. Defaults to 24. */
  size?: number;
  /** Stroke width in viewBox units. Defaults to 1.75. */
  strokeWidth?: number;
  className?: string;
  /**
   * Accessible name. When omitted the icon is decorative (`aria-hidden`),
   * which is the right default inside labelled buttons.
   */
  title?: string;
}

/** Props shared by the full-colour artwork (logo). */
export interface IIllustrationProps {
  size?: number;
  className?: string;
}
