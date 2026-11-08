import { TCoinAmountSize } from './interface';

export const coinAmountRootStyles = `inline-flex items-center gap-1.5 tabular-nums`;

export const coinAmountTextStyles: Record<TCoinAmountSize, string> = {
  sm: `typo-s2`,
  md: `typo-s1`,
  lg: `typo-h3`,
  xl: `typo-display`,
};

/** Gold coin disc with a soft rim — the only warm colour in the UI. */
export const coinDiscStyles = `inline-flex shrink-0 items-center justify-center rounded-full bg-coin-gradient text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18),0_2px_4px_rgb(194_122_18/0.35)]`;

export const coinDiscSize: Record<
  TCoinAmountSize,
  { disc: number; glyph: number }
> = {
  sm: { disc: 16, glyph: 10 },
  md: { disc: 20, glyph: 12 },
  lg: { disc: 26, glyph: 16 },
  xl: { disc: 36, glyph: 22 },
};

export const coinCreditStyles = `text-tone-success-fg`;
export const coinDebitStyles = `text-tone-danger-fg`;
