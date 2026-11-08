import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceKeys, staffKeys } from '@/lib/query';
import type { TDeclarableWorkMode } from '@/lib/presence';
import { attendanceService, IAttendanceDay } from '@/services';

/** While not checked in yet, look for the gate's check-in this often. */
export const CHECK_IN_POLL_INTERVAL_MS = 30_000;

/**
 * Today's attendance. Polls until a check-in arrives (the gate writes it on
 * the server, the app only finds out by asking), then stops.
 */
export const useAttendanceToday = () =>
  useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: () => attendanceService.getToday(),
    refetchInterval: (query) =>
      query.state.data?.checkedInAt ? false : CHECK_IN_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

/** Declares (or clears) a remote / leave day. */
export const useSetWorkMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workMode: TDeclarableWorkMode | null) =>
      attendanceService.setWorkMode(workMode),
    onSuccess: (day) => {
      queryClient.setQueryData<IAttendanceDay>(attendanceKeys.today(), day);
      void queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
};
