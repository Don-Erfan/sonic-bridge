/**
 * Semantic colour role shared by badges, status dots and cards. Domain
 * modules say *what* a state means (`success`, `danger`…); components map the
 * tone onto tokens (`bg-tone-success text-tone-success-fg`).
 */
export type TTone =
  `primary` | `info` | `success` | `warning` | `danger` | `neutral`;
