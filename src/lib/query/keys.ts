import { IFeatureQueryKeys, TQueryKey } from './interface';

/**
 * Query Key Factory.
 *
 * A single source of truth for cache keys so invalidation stays precise and
 * "stringly-typed" drift can't creep in. Keys are hierarchical, so
 * invalidating a parent key cascades to every child.
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: walletKeys.all }); // whole feature
 */
export const queryKeys = {
  root: [`ozone`] as const satisfies TQueryKey,
} as const;

const branch = <TName extends string>(name: TName) =>
  [...queryKeys.root, name] as const;

const profileRoot = branch(`profile`);
const staffRoot = branch(`staff`);
const attendanceRoot = branch(`attendance`);
const walletRoot = branch(`wallet`);
const storeRoot = branch(`store`);
const roomRoot = branch(`rooms`);
const eventRoot = branch(`events`);
const moodRoot = branch(`mood`);
const adminRoot = branch(`admin`);

/** The signed-in user. */
export const profileKeys = {
  all: profileRoot,
  current: () => [...profileRoot, `current`] as const,
} as const satisfies IFeatureQueryKeys;

/** Colleagues and their presence. */
export const staffKeys = {
  all: staffRoot,
  list: () => [...staffRoot, `list`] as const,
} as const satisfies IFeatureQueryKeys;

/** Today's face check-in and declared work mode. */
export const attendanceKeys = {
  all: attendanceRoot,
  today: () => [...attendanceRoot, `today`] as const,
} as const satisfies IFeatureQueryKeys;

/** Coin balance and ledger. */
export const walletKeys = {
  all: walletRoot,
  summary: () => [...walletRoot, `summary`] as const,
  transactions: () => [...walletRoot, `transactions`] as const,
} as const satisfies IFeatureQueryKeys;

/** Coin store catalogue and the user's orders. */
export const storeKeys = {
  all: storeRoot,
  products: () => [...storeRoot, `products`] as const,
  orders: () => [...storeRoot, `orders`] as const,
} as const satisfies IFeatureQueryKeys;

/** Meeting rooms with today's bookings. */
export const roomKeys = {
  all: roomRoot,
  list: () => [...roomRoot, `list`] as const,
} as const satisfies IFeatureQueryKeys;

/** Company events. */
export const eventKeys = {
  all: eventRoot,
  list: () => [...eventRoot, `list`] as const,
} as const satisfies IFeatureQueryKeys;

/** The signed-in user's mood / status. */
export const moodKeys = {
  all: moodRoot,
  current: () => [...moodRoot, `current`] as const,
} as const satisfies IFeatureQueryKeys;

/** Administration panel data (everyone's records). */
export const adminKeys = {
  all: adminRoot,
  staff: () => [...adminRoot, `staff`] as const,
  staffTransactions: (id: string) =>
    [...adminRoot, `staff`, id, `transactions`] as const,
  products: () => [...adminRoot, `products`] as const,
  orders: () => [...adminRoot, `orders`] as const,
  rooms: () => [...adminRoot, `rooms`] as const,
  bookings: () => [...adminRoot, `bookings`] as const,
  events: () => [...adminRoot, `events`] as const,
} as const satisfies IFeatureQueryKeys;
