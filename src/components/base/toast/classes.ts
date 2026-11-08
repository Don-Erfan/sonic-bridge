import { TToastVariant } from './interface';

/** Raised soft card floating over the page. */
export const toastRootStyles = `flex-row items-start gap-3 rounded-20 border border-neu-outline bg-neu p-3.5 text-fg-primary shadow-float`;

export const toastIconWrapStyles = `flex size-9 shrink-0 items-center justify-center rounded-full shadow-neu-inset-sm`;

export const toastAccentStyles: Record<TToastVariant, string> = {
  danger: `text-danger-600`,
  warning: `text-warning-700`,
  info: `text-secondary-600`,
  success: `text-teal-700`,
};

export const toastContentStyles = `min-w-0 flex-1 gap-0.5 self-center`;

export const toastTitleStyles = `typo-s1 text-fg-primary`;

export const toastDescriptionStyles = `typo-b2 text-fg-secondary`;

export const toastActionStyles = `mt-2 h-8 self-start rounded-12 bg-neu px-3 typo-s2 text-accent-fg shadow-neu-sm [--button-bg:var(--neu-base)] [--button-bg-hover:var(--neu-base)] [--button-bg-pressed:var(--neu-base)] [--button-fg:var(--accent-fg)] data-pressed:shadow-neu-pressed data-pressed:transform-none`;

export const toastCloseStyles = `size-7 min-w-7 shrink-0 rounded-full bg-transparent p-0 text-fg-tertiary data-hovered:bg-default-200 data-pressed:transform-none [&_svg]:m-0`;
