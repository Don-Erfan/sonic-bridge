/**
 * Root component barrel.
 *
 * One line per folder, alphabetical, `export *` only. Because `export *`
 * skips default exports, every folder also exposes a **named** export of
 * its component. Consumers import from here:
 *
 * @example
 * import { Button, Sheet, notify, RoomsView } from '@/components';
 *
 * `./base` holds the neumorphic primitives, `./layout` the page frame and
 * the remaining folders are features (one folder per domain). Icons live in
 * `../icons`.
 */
export * from '../icons';
export * from './admin';
export * from './announcements';
export * from './attendance';
export * from './auth';
export * from './base';
export * from './events';
export * from './home';
export * from './layout';
export * from './mood';
export * from './profile';
export * from './providers';
export * from './pwa';
export * from './rooms';
export * from './sonic-test';
export * from './store';
export * from './team';
export * from './theme-switch';
export * from './theme-toggle';
export * from './wallet';
