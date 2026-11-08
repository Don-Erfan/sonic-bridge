import type { TTone } from '../tone';

/** What a room is doing right now. */
export type TRoomStatus = `available` | `upcoming` | `occupied`;

/** Minimal booking shape the room rules need. */
export interface IBookingInterval {
  id: string;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it. */
  startsAt: number;
  /** Unix time in milliseconds (UTC), as `Date.getTime()` returns it; exclusive. */
  endsAt: number;
  organizerId: string;
}

/** Everything the UI needs to know about a room at one instant. */
export interface IRoomSnapshot<TBooking extends IBookingInterval> {
  state: IRoomState;
  /** Booking in progress, if any. */
  current: TBooking | null;
  /** Next booking that has not started yet. */
  next: TBooking | null;
  /** While free: when the next booking starts (`null` = free all day). */
  freeUntil: Date | null;
  /** While occupied: end of the current run of back-to-back bookings. */
  busyUntil: Date | null;
  /** The current booking belongs to the viewer. */
  isMine: boolean;
}

/**
 * State object of a room (State pattern). The UI asks the state what to show
 * and which actions are allowed instead of branching on a status string.
 */
export interface IRoomState {
  status: TRoomStatus;
  tone: TTone;
  /** A new booking can start now. */
  canBook: boolean;
  /** The viewer may end the current booking early. */
  canRelease(snapshot: { isMine: boolean }): boolean;
}
