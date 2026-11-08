import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomKeys } from '@/lib/query';
import { IBookRoomPayload, IMeetingRoom, roomService } from '@/services';

/** Rooms change minute to minute: refresh often while visible. */
export const ROOMS_POLL_INTERVAL_MS = 30_000;

/** Meeting rooms with today's bookings. */
export const useRooms = () =>
  useQuery({
    queryKey: roomKeys.list(),
    queryFn: () => roomService.getRooms(),
    refetchInterval: ROOMS_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

/**
 * Books a room. The server decides conflicts; on success the booking is
 * written into the cache at once and the list is refetched to pick up
 * anything colleagues booked meanwhile.
 */
export const useBookRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IBookRoomPayload) => roomService.bookRoom(payload),
    onSuccess: (booking) => {
      queryClient.setQueryData<IMeetingRoom[]>(roomKeys.list(), (rooms) =>
        rooms?.map((room) =>
          room.id === booking.roomId
            ? { ...room, bookings: [...room.bookings, booking] }
            : room,
        ),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
};

/** Cancels a future booking or releases a room in use. */
export const useEndBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => roomService.endBooking(bookingId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
};
