import { addMinutes, endOfDay, minutesBetween } from '../utils';
import {
  IBookingInterval,
  IRoomSnapshot,
  IRoomState,
  TRoomStatus,
} from './interface';

/** A free room whose next booking starts within this window is "upcoming". */
export const UPCOMING_THRESHOLD_MINUTES = 30;

/** Shortest booking the app offers. */
export const MIN_BOOKING_MINUTES = 15;

/** Longest single booking. */
export const MAX_BOOKING_MINUTES = 180;

/**
 * A booking starting within this window already counts as in progress: it
 * absorbs the shared clock's tick interval and client/server clock skew, so
 * a meeting booked "from now" shows as occupied immediately.
 */
export const START_TOLERANCE_MS = 60_000;

/** Durations offered when booking "from now". */
export const BOOKING_DURATIONS: readonly number[] = [15, 30, 45, 60, 90, 120];

/* ------------------------------------------------------------- States -- */

const availableState: IRoomState = {
  status: `available`,
  tone: `success`,
  canBook: true,
  canRelease: () => false,
};

const upcomingState: IRoomState = {
  status: `upcoming`,
  tone: `warning`,
  canBook: true,
  canRelease: () => false,
};

const occupiedState: IRoomState = {
  status: `occupied`,
  tone: `danger`,
  canBook: false,
  canRelease: ({ isMine }) => isMine,
};

/** One shared instance per state (they hold no per-room data). */
export const roomStates: Record<TRoomStatus, IRoomState> = {
  available: availableState,
  upcoming: upcomingState,
  occupied: occupiedState,
};

/* ----------------------------------------------------------- Resolver -- */

const byStart = (a: IBookingInterval, b: IBookingInterval): number =>
  a.startsAt - b.startsAt;

/**
 * End of the run of bookings that starts with `current`: a meeting followed
 * immediately by another keeps the room busy until the last one ends.
 */
const findBusyUntil = (
  current: IBookingInterval,
  sorted: readonly IBookingInterval[],
): Date => {
  let busyUntil = new Date(current.endsAt);
  for (const booking of sorted) {
    const start = new Date(booking.startsAt);
    const end = new Date(booking.endsAt);
    if (start <= busyUntil && end > busyUntil) busyUntil = end;
  }
  return busyUntil;
};

/**
 * Resolves which state a room is in at `now` and the facts around it.
 *
 * @example
 * const { state, freeUntil } = resolveRoomSnapshot(room.bookings, now, me.id);
 * state.canBook; // → true
 */
export const resolveRoomSnapshot = <TBooking extends IBookingInterval>(
  bookings: readonly TBooking[],
  now: Date,
  viewerId: string,
): IRoomSnapshot<TBooking> => {
  const sorted = bookings.toSorted(byStart);
  const startedBy = new Date(now.getTime() + START_TOLERANCE_MS);
  const current =
    sorted.find(
      (booking) =>
        new Date(booking.startsAt) <= startedBy &&
        new Date(booking.endsAt) > now,
    ) ?? null;
  const next =
    sorted.find((booking) => new Date(booking.startsAt) > startedBy) ?? null;

  if (current) {
    return {
      state: occupiedState,
      current,
      next,
      freeUntil: null,
      busyUntil: findBusyUntil(current, sorted),
      isMine: current.organizerId === viewerId,
    };
  }

  const freeUntil = next ? new Date(next.startsAt) : null;
  const isUpcoming =
    freeUntil !== null &&
    minutesBetween(now, freeUntil) <= UPCOMING_THRESHOLD_MINUTES;

  return {
    state: isUpcoming ? upcomingState : availableState,
    current: null,
    next,
    freeUntil,
    busyUntil: null,
    isMine: false,
  };
};

/**
 * Durations that fit before the next booking and before midnight (bookings
 * never cross the day). Empty when the room cannot be booked now.
 */
export const getBookableDurations = (
  snapshot: Pick<IRoomSnapshot<IBookingInterval>, `state` | `freeUntil`>,
  now: Date,
): number[] => {
  if (!snapshot.state.canBook) return [];
  const limit = Math.min(
    MAX_BOOKING_MINUTES,
    minutesBetween(now, snapshot.freeUntil ?? endOfDay(now)),
  );
  return BOOKING_DURATIONS.filter(
    (minutes) => minutes >= MIN_BOOKING_MINUTES && minutes <= limit,
  );
};

/** `[start, end)` of a booking that starts now and lasts `minutes`. */
export const createBookingWindow = (now: Date, minutes: number) => ({
  startsAt: now.getTime(),
  endsAt: addMinutes(now, minutes).getTime(),
});
