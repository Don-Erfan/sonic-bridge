/** Inset track the options sit in. */
export const segmentedTrackStyles = `gap-1 rounded-20 border border-neu-outline bg-neu p-1 shadow-neu-inset`;

/** Equal-width options that may shrink on narrow phones instead of overflowing. */
export const segmentedFullWidthStyles = `flex w-full [&>*]:min-w-0 [&>*]:flex-1`;

/** Sizes to its options; wrap it in a scroll container where it may overflow. */
export const segmentedInlineStyles = `inline-flex w-max`;

/**
 * Unselected options are flat; the selected one is raised out of the track
 * (soft-UI "selected") and switches to the accent colour, so selection never
 * relies on shadow alone.
 */
export const segmentedOptionStyles = `gap-1.5 rounded-16 whitespace-nowrap [--toggle-button-bg:transparent] [--toggle-button-bg-hover:transparent] [--toggle-button-bg-pressed:transparent] [--toggle-button-fg:var(--fg-tertiary)] [--toggle-button-bg-selected:var(--neu-base)] [--toggle-button-bg-selected-hover:var(--neu-base)] [--toggle-button-bg-selected-pressed:var(--neu-base)] [--toggle-button-fg-selected:var(--accent-fg)] transition-[box-shadow,color] duration-200 data-hovered:text-fg-secondary data-selected:font-semibold data-selected:shadow-neu-sm data-pressed:transform-none data-focus-visible:ring-2 data-focus-visible:ring-primary-500 [&_svg]:m-0`;

export const segmentedOptionSizeStyles = {
  sm: `h-8 px-3 typo-s2`,
  md: `h-10 px-4 typo-s1`,
} as const;

export const segmentedCountStyles = `rounded-full bg-default-200 px-1.5 typo-c1 tabular-nums text-fg-secondary`;
