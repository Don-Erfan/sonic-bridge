/**
 * Icon barrel.
 *
 * Icons live in their own top-level directory but are re-exported through
 * `@/components`, so consumers import from one place. Glyphs come from the
 * shared registry via `<Icon name="…" />`; the brand artwork has dedicated
 * components.
 */
export * from './interface';
export * from './registry';
export * from './Icon';
export * from './LogoMark';
export * from './LogoWordmark';
