/** Fixed to the bottom, above the iOS home indicator. Phones/tablets only. */
export const bottomNavRootStyles = `fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] lg:hidden`;

/** Raised floating bar. */
export const bottomNavBarStyles = `mx-auto grid h-(--bottom-nav-height) max-w-lg grid-cols-5 items-center gap-1 rounded-28 border border-neu-outline bg-neu px-2 shadow-neu-lg`;

export const bottomNavLinkStyles = `group flex h-full flex-col items-center justify-center gap-1 rounded-20 text-fg-tertiary outline-none focus-visible:ring-2 focus-visible:ring-primary-500 aria-[current=page]:text-accent-fg`;

/** Active tab: the icon sinks into the bar (pressed) and turns accent. */
export const bottomNavIconStyles = `flex h-8 w-12 items-center justify-center rounded-full transition-[box-shadow] duration-300 group-aria-[current=page]:shadow-neu-pressed`;

export const bottomNavLabelStyles = `typo-c1 group-aria-[current=page]:font-semibold`;
