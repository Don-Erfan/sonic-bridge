import type { IMeetingRoom } from '@/services';

export interface IRoomCardProps {
  room: IMeetingRoom;
  /** The viewer's id: decides which bookings are "mine". */
  viewerId: string;
  /** Opens the booking sheet for this room. */
  onBook: (room: IMeetingRoom) => void;
}
