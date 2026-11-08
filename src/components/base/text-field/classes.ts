export const textFieldRootStyles = `flex w-full flex-col gap-1.5`;

export const textFieldLabelStyles = `typo-s1 text-fg-secondary`;

export const textFieldWrapperStyles = `relative flex items-center`;

/**
 * Inset well. Text is 16px on purpose: iOS Safari zooms the page when an
 * input below 16px gains focus. `unicode-bidi: plaintext` lets typed Persian
 * and Latin each align naturally.
 */
export const textFieldControlStyles = `w-full rounded-16 border border-neu-outline bg-neu px-4 text-base leading-6 text-fg-primary shadow-neu-inset outline-none [unicode-bidi:plaintext] placeholder:text-fg-quaternary transition-shadow [&::-webkit-search-cancel-button]:appearance-none data-focused:ring-2 data-focused:ring-primary-500 data-invalid:ring-2 data-invalid:ring-danger-500 data-disabled:opacity-50`;

export const textFieldInputHeightStyles = `h-12`;

export const textFieldTextAreaStyles = `min-h-24 resize-none py-3`;

export const textFieldWithStartIconStyles = `ps-11`;

export const textFieldWithEndContentStyles = `pe-12`;

export const textFieldStartIconStyles = `pointer-events-none absolute start-4 text-fg-tertiary`;

export const textFieldEndContentStyles = `absolute end-1`;

export const textFieldDescriptionStyles = `typo-b2 text-fg-tertiary`;

export const textFieldErrorStyles = `typo-b2 text-danger-600`;
