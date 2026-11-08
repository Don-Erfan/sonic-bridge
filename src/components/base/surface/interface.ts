import type { ReactNode } from 'react';

export interface ISurfaceProps {
  children?: ReactNode;
  /**
   * `raised` sits above the page, `inset` is pressed into it (wells, empty
   * areas), `flat` has no depth (nested content).
   */
  variant?: TSurfaceVariant;
  /** Shadow depth of a raised surface. */
  elevation?: TSurfaceElevation;
  padding?: TSurfacePadding;
  /** Semantic element. Defaults to `div`. */
  as?: `div` | `section` | `article` | `li` | `aside`;
  /** Layout-only classes (grid placement, spacing). Not for colours. */
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export type TSurfaceVariant = `raised` | `inset` | `flat`;
export type TSurfaceElevation = `sm` | `md` | `lg`;
export type TSurfacePadding = `none` | `sm` | `md` | `lg`;
