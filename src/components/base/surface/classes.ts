import {
  TSurfaceElevation,
  TSurfacePadding,
  TSurfaceVariant,
} from './interface';

/** Soft UI: every surface shares the page colour; only shadows differ. */
export const surfaceBaseStyles = `rounded-24 border border-neu-outline bg-neu text-fg-primary`;

export const surfaceVariantStyles: Record<TSurfaceVariant, string> = {
  raised: ``,
  inset: `shadow-neu-inset`,
  flat: ``,
};

export const surfaceElevationStyles: Record<TSurfaceElevation, string> = {
  sm: `shadow-neu-sm`,
  md: `shadow-neu`,
  lg: `shadow-neu-lg`,
};

export const surfacePaddingStyles: Record<TSurfacePadding, string> = {
  none: `p-0`,
  sm: `p-3`,
  md: `p-4`,
  lg: `p-5 md:p-6`,
};
