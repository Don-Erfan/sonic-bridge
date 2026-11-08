import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TRsvp } from '@/lib/events';
import { eventKeys } from '@/lib/query';
import { eventService, ICompanyEvent } from '@/services';

/** Company events. */
export const useEvents = () =>
  useQuery({
    queryKey: eventKeys.list(),
    queryFn: () => eventService.getEvents(),
  });

/**
 * Answers an invitation. Optimistic: the choice and head-count change
 * instantly (an RSVP is cheap to undo) and roll back if the request fails.
 */
export const useRespondToEvent = () => {
  const queryClient = useQueryClient();
  const key = eventKeys.list();

  return useMutation({
    mutationFn: ({ eventId, rsvp }: { eventId: string; rsvp: TRsvp }) =>
      eventService.respond(eventId, rsvp),
    onMutate: async ({ eventId, rsvp }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ICompanyEvent[]>(key);
      queryClient.setQueryData<ICompanyEvent[]>(key, (events) =>
        events?.map((event) => {
          if (event.id !== eventId) return event;
          const delta =
            (rsvp === `going` ? 1 : 0) - (event.myRsvp === `going` ? 1 : 0);
          return {
            ...event,
            myRsvp: rsvp,
            attendeesCount: Math.max(0, event.attendeesCount + delta),
          };
        }),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<ICompanyEvent[]>(key, (events) =>
        events?.map((event) => (event.id === updated.id ? updated : event)),
      );
    },
  });
};
