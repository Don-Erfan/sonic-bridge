import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moodKeys, staffKeys } from '@/lib/query';
import { IMood, moodService, statusSync } from '@/services';
import { IMoodSaveResult, IMoodSubmission } from './interface';

/** The signed-in user's current mood (`null` when none or expired). */
export const useMyMood = () =>
  useQuery({
    queryKey: moodKeys.current(),
    queryFn: () => moodService.getMood(),
  });

/**
 * Saves the mood, then mirrors it to Mattermost. The two steps are
 * deliberately sequential and independent: the mood is the source of truth
 * and is saved even if Mattermost is down — the per-target reports let the
 * UI say "saved, but not synced" instead of failing the whole action.
 */
export const useUpdateMood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shouldSync,
      ...payload
    }: IMoodSubmission): Promise<IMoodSaveResult> => {
      const mood = await moodService.updateMood(payload);
      const reports = shouldSync ? await statusSync.sync(mood) : [];
      return { mood, reports };
    },
    onSuccess: ({ mood }) => {
      queryClient.setQueryData<IMood | null>(moodKeys.current(), mood);
      void queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
};

/** Clears the mood here and in Mattermost. */
export const useClearMood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<IMoodSaveResult> => {
      await moodService.clearMood();
      return { mood: null, reports: await statusSync.sync(null) };
    },
    onSuccess: () => {
      queryClient.setQueryData<IMood | null>(moodKeys.current(), null);
      void queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
};
