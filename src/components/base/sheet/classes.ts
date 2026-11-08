/** Dimmed page behind the sheet. */
export const sheetBackdropStyles = `bg-brand-navy/40`;

/**
 * Bottom sheet: full width on phones, a centred 32rem column on larger
 * screens; never taller than 90% of the *visual* viewport. React Aria keeps
 * `--visual-viewport-height` in sync with it, which — unlike `dvh` — shrinks
 * when the iOS keyboard opens, so the header never slides off-screen.
 */
export const sheetDialogStyles = `mx-auto flex max-h-[calc(var(--visual-viewport-height,100dvh)*0.9)] w-full max-w-lg flex-col rounded-t-28 border border-neu-outline bg-neu p-0 text-fg-primary shadow-float outline-none`;

/**
 * A tall, full-width grab area (easy to hit with a thumb) around the visible
 * bar — HeroUI renders the bar as the handle's child.
 */
export const sheetHandleStyles = `w-full shrink-0 pt-2.5 pb-1 [&>[data-slot=drawer-handle-bar]]:h-1.5 [&>[data-slot=drawer-handle-bar]]:w-12 [&>[data-slot=drawer-handle-bar]]:rounded-full [&>[data-slot=drawer-handle-bar]]:bg-default-300`;

export const sheetHeaderStyles = `flex shrink-0 flex-row items-center justify-between gap-3 px-5 pt-3 pb-2`;

export const sheetHeadingStyles = `typo-h3 text-fg-primary`;

/** `mx-0` cancels HeroUI's negative margin, which made the body overflow the sheet. */
export const sheetBodyStyles = `mx-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-4`;

/** Keeps actions clear of the iOS home indicator. */
export const sheetFooterStyles = `shrink-0 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]`;
