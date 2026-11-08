import { useQuery } from '@tanstack/react-query';
import { staffKeys } from '@/lib/query';
import { staffService } from '@/services';

/** How often presence is refreshed while the app is in the foreground. */
export const STAFF_POLL_INTERVAL_MS = 60_000;

/**
 * Everyone with today's presence and mood. Kept fresh while visible: people
 * arrive at the gate all morning. (TanStack pauses polling in background
 * tabs.)
 */
export const useStaff = () =>
  useQuery({
    queryKey: staffKeys.list(),
    queryFn: () => staffService.getStaff(),
    refetchInterval: STAFF_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
