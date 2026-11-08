import { useSyncExternalStore } from 'react';
import { clockStore } from '@/lib/clock';

/**
 * The current time, shared by every subscriber and refreshed every 30 s
 * (and when the app comes back to the foreground).
 *
 * Use it instead of `new Date()` in render: it keeps render pure and makes
 * time-based UI (room states, "happening now") update on its own. The value
 * is the epoch on the server — only read it in client-data branches.
 *
 * @example
 * const now = useNow();
 * const snapshot = resolveRoomSnapshot(room.bookings, now, me.id);
 */
export const useNow = (): Date => {
  const now = useSyncExternalStore(
    clockStore.subscribe,
    clockStore.getSnapshot,
    clockStore.getServerSnapshot,
  );
  return new Date(now);
};
