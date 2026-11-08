import type { IBookingInterval } from '@/lib/rooms';

export type TRoomAmenity =
  `display` | `video-conference` | `whiteboard` | `sound-system`;

export interface IRoomBooking extends IBookingInterval {
  roomId: string;
  title: string;
  organizerName: string;
}

export interface IMeetingRoom {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  amenities: TRoomAmenity[];
  /** Today's bookings, including finished ones. */
  bookings: IRoomBooking[];
}

/** Body of `POST /rooms/:id/bookings`. */
export interface IBookRoomPayload {
  roomId: string;
  title: string;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  startsAt: number;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it; exclusive. */
  endsAt: number;
}

/**
 * Meeting-room API contract. Booking conflicts are rejected with 409 by the
 * server, which is authoritative for concurrent bookings.
 */
export interface IRoomService {
  /** `GET /rooms` */
  getRooms(): Promise<IMeetingRoom[]>;
  /** `POST /rooms/:id/bookings` */
  bookRoom(payload: IBookRoomPayload): Promise<IRoomBooking>;
  /**
   * `DELETE /rooms/bookings/:id` — cancels a future booking, or ends an
   * ongoing one now (releasing the room). Organizer only (403 otherwise).
   */
  endBooking(bookingId: string): Promise<void>;
}
