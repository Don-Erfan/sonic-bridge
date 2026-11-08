/**
 * When each person last opened the announcements list on this device, so
 * the header can mark newer ones as unread. Kept in `localStorage` per
 * profile id (several people may share a device) and synced across tabs.
 * Plugs into `useSyncExternalStore`; the server snapshot is "nothing seen
 * yet" never shown, since the dot needs the list first.
 */
const STORAGE_PREFIX = `ozone.announcements.seen.`;

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const announcementsSeen = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith(STORAGE_PREFIX)) listener();
    };
    window.addEventListener(`storage`, onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener(`storage`, onStorage);
    };
  },

  /** Epoch ms of the newest announcement this person has seen (0: none). */
  get(profileId: string): number {
    try {
      const value = Number(
        window.localStorage.getItem(STORAGE_PREFIX + profileId),
      );
      return Number.isFinite(value) ? value : 0;
    } catch {
      return 0;
    }
  },

  /** Records that announcements up to `createdAt` were seen (never moves back). */
  markSeen(profileId: string, createdAt: number): void {
    if (createdAt <= announcementsSeen.get(profileId)) return;
    try {
      window.localStorage.setItem(
        STORAGE_PREFIX + profileId,
        String(createdAt),
      );
    } catch {
      // Private mode: the dot simply stays until the list is opened again.
    }
    notify();
  },
};
