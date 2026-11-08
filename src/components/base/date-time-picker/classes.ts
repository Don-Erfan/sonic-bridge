export const dateTimePickerRootStyles = `flex w-full flex-col gap-1.5`;

export const dateTimePickerLabelStyles = `typo-s1 text-fg-secondary`;

/**
 * The same inset well as `TextField` (16px text, so iOS Safari does not zoom
 * on focus). The ring follows keyboard focus inside the segments, not the
 * calendar button.
 */
export const dateTimePickerGroupStyles = `h-12 w-full rounded-16 border border-neu-outline bg-neu text-base text-fg-primary shadow-neu-inset data-focus-within:ring-2 data-focus-within:ring-primary-500 data-invalid:ring-2 data-invalid:ring-danger-500 data-disabled:opacity-50`;

/**
 * Segments flow as inline text instead of HeroUI's flex row. As flex items
 * they would be ordered by the page direction alone, so on this RTL page the
 * time read backwards (`۰۰:۱۹`); as text, the Unicode bidi algorithm (and
 * React Aria's isolates around the time) lays them out the way Persian text
 * shows a date: `۱۴۰۵/۰۸/۱۷، ۱۹:۰۰`.
 */
export const dateTimePickerInputStyles = `block h-full content-center overflow-x-auto scrollbar-none px-4 text-base whitespace-nowrap`;

export const dateTimePickerSegmentStyles = `inline`;

export const dateTimePickerSuffixStyles = `pe-1`;

export const dateTimePickerDescriptionStyles = `typo-b2 text-fg-tertiary`;

export const dateTimePickerErrorStyles = `typo-b2 text-danger-600`;

export const dateTimePickerPopoverStyles = `flex flex-col gap-3 p-3`;

export const dateTimePickerTimeRowStyles = `flex items-center justify-between gap-3 border-t border-neu-outline pt-3`;

export const dateTimePickerTimeLabelStyles = `typo-s1 text-fg-secondary`;

/**
 * HeroUI draws the month arrows for left-to-right; mirrored on this RTL page
 * so each points outward, toward the month it opens.
 */
export const dateTimePickerNavButtonStyles = `rtl:[&_svg]:-scale-x-100`;
