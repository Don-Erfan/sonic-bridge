import { useCallback, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { announcementsSeen } from '@/lib/announcements';
import { announcementKeys } from '@/lib/query';
import { announcementService } from '@/services';
import { useProfile } from '../profile';

/** Announcements to all staff, newest first. */
export const useAnnouncements = () =>
  useQuery({
    queryKey: announcementKeys.list(),
    queryFn: () => announcementService.getAnnouncements(),
    refetchOnWindowFocus: true,
  });

/**
 * Whether there are announcements newer than the last ones this person
 * opened on this device, and `markSeen` to call when the list is shown.
 */
export const useUnreadAnnouncements = () => {
  const { data: profile } = useProfile();
  const { data: announcements } = useAnnouncements();
  const profileId = profile?.id;
  const seen = useSyncExternalStore(
    announcementsSeen.subscribe,
    () => (profileId ? announcementsSeen.get(profileId) : Infinity),
    () => Infinity,
  );
  const newest = announcements?.[0]?.createdAt ?? 0;

  const markSeen = useCallback(() => {
    if (profileId && newest) announcementsSeen.markSeen(profileId, newest);
  }, [profileId, newest]);

  return { hasUnread: newest > seen, markSeen };
};
