'use client';
import React, { FC, useState } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useEndBooking, useNow } from '@/hooks';
import { Icon } from '@/icons';
import { getBookableDurations, resolveRoomSnapshot } from '@/lib/rooms';
import {
  formatNumber,
  formatTime,
  formatTimeRange,
  localizeDigits,
} from '@/lib/utils';
import type { IRoomBooking } from '@/services';
import {
  Badge,
  Button,
  ConfirmDialog,
  IconButton,
  notify,
  Surface,
} from '../../base';
import {
  AMENITY_ICON,
  MAX_LISTED_BOOKINGS,
  ROOM_STATUS_LABEL,
} from './constants';
import { IRoomCardProps } from './interface';

/** What the confirmation dialog is about. */
interface IPendingAction {
  kind: `release` | `cancel`;
  booking: IRoomBooking;
}

/**
 * A meeting room right now. Everything state-dependent — tone, label,
 * whether it can be booked or released — comes from the room's State object
 * (`resolveRoomSnapshot`), re-evaluated as the shared clock ticks.
 *
 * @example
 * <RoomCard room={room} viewerId={me.id} onBook={openSheet} />
 */
export const RoomCard: FC<IRoomCardProps> = ({ room, viewerId, onBook }) => {
  const now = useNow();
  const endBooking = useEndBooking();
  // Kept after closing so the dialog's text does not change mid-animation.
  const [pending, setPending] = useState<IPendingAction | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const snapshot = resolveRoomSnapshot(room.bookings, now, viewerId);
  const { state, current, next, freeUntil, busyUntil, isMine } = snapshot;
  const canBookNow = getBookableDurations(snapshot, now).length > 0;
  const titleId = `room-${room.id}-title`;

  const upcoming = room.bookings
    .filter(
      (booking) =>
        booking.id !== current?.id && new Date(booking.startsAt) > now,
    )
    .toSorted((a, b) => a.startsAt - b.startsAt);

  const statusLine = (() => {
    if (state.status === `occupied` && busyUntil) {
      return fillTemplate(uiText.rooms.busyUntil, {
        time: formatTime(busyUntil),
      });
    }
    if (state.status === `upcoming` && next) {
      return fillTemplate(uiText.rooms.reservedAt, {
        time: formatTime(next.startsAt),
      });
    }
    return freeUntil
      ? fillTemplate(uiText.rooms.freeUntil, { time: formatTime(freeUntil) })
      : uiText.rooms.freeAllDay;
  })();

  const askToConfirm = (action: IPendingAction) => {
    setPending(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      await endBooking.mutateAsync(pending.booking.id);
      notify.success(
        pending.kind === `release`
          ? uiText.rooms.released
          : uiText.rooms.cancelled,
      );
    } catch (error) {
      notify.error(error);
      throw error;
    }
  };

  return (
    <Surface as="article" padding="lg" aria-labelledby={titleId}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="typo-h3 text-fg-primary">
            {room.name}
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 typo-b2 text-fg-tertiary">
            <span>
              {fillTemplate(uiText.rooms.floor, {
                floor: localizeDigits(room.floor),
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="users" size={14} />
              {fillTemplate(uiText.rooms.capacity, {
                count: formatNumber(room.capacity),
              })}
            </span>
          </p>
        </div>
        <Badge
          tone={state.tone}
          hasDot
          isPulsing={state.status === `occupied`}
          size="md"
        >
          {ROOM_STATUS_LABEL[state.status]}
        </Badge>
      </div>

      <div className="mt-4 rounded-20 px-4 py-3 shadow-neu-inset">
        <p className="typo-s1 text-fg-primary">{statusLine}</p>
        {current && (
          <p className="mt-1 typo-b2 text-fg-secondary">
            {current.title} ·{' '}
            {isMine ? uiText.rooms.mine : current.organizerName}
          </p>
        )}
      </div>

      <ul
        aria-label={uiText.rooms.amenitiesLabel}
        className="mt-3 flex flex-wrap gap-2"
      >
        {room.amenities.map((amenity) => (
          <li
            key={amenity}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 typo-c1 text-fg-secondary shadow-neu-sm"
          >
            <Icon name={AMENITY_ICON[amenity]} size={14} />
            {uiText.rooms.amenities[amenity]}
          </li>
        ))}
      </ul>

      {upcoming.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <h3 className="typo-s2 text-fg-tertiary">{uiText.rooms.schedule}</h3>
          <ul className="flex flex-col gap-1.5">
            {upcoming.slice(0, MAX_LISTED_BOOKINGS).map((booking) => {
              const isMyBooking = booking.organizerId === viewerId;
              return (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="min-w-0 truncate typo-b2 text-fg-secondary">
                    <bdi className="tabular-nums">
                      {formatTimeRange(booking.startsAt, booking.endsAt)}
                    </bdi>
                    {` · `}
                    {booking.title}
                  </span>
                  {isMyBooking ? (
                    <span className="flex shrink-0 items-center gap-1">
                      <Badge tone="primary">{uiText.rooms.mine}</Badge>
                      <IconButton
                        icon="trash"
                        size="sm"
                        variant="ghost"
                        aria-label={`${uiText.rooms.cancelBooking}: ${booking.title}`}
                        onPress={() =>
                          askToConfirm({ kind: `cancel`, booking })
                        }
                      />
                    </span>
                  ) : (
                    <span className="shrink-0 typo-c1 text-fg-tertiary">
                      {booking.organizerName}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-5">
        {current && state.canRelease(snapshot) ? (
          <Button
            variant="secondary"
            startIcon="logout"
            isFullWidth
            onPress={() => askToConfirm({ kind: `release`, booking: current })}
          >
            {uiText.rooms.release}
          </Button>
        ) : state.canBook ? (
          <Button
            variant="primary"
            startIcon="plus"
            isFullWidth
            isDisabled={!canBookNow}
            onPress={() => onBook(room)}
          >
            {uiText.rooms.book}
          </Button>
        ) : null}
        {state.canBook && !canBookNow && (
          <p className="mt-2 typo-c1 text-fg-tertiary">{uiText.rooms.noSlot}</p>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          pending?.kind === `release`
            ? uiText.rooms.releaseTitle
            : uiText.rooms.cancelTitle
        }
        message={
          pending?.kind === `release`
            ? fillTemplate(uiText.rooms.releaseMessage, { room: room.name })
            : fillTemplate(uiText.rooms.cancelMessage, {
                title: pending?.booking.title ?? ``,
              })
        }
        confirmLabel={
          pending?.kind === `release`
            ? uiText.rooms.release
            : uiText.rooms.cancelBooking
        }
        onConfirm={handleConfirm}
      />
    </Surface>
  );
};

RoomCard.displayName = `RoomCard`;

export default RoomCard;
