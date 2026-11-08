'use client';
import React, { FC, useState } from 'react';
import { uiText } from '@/config';
import { useNow, useProfile, useRooms } from '@/hooks';
import { resolveRoomSnapshot } from '@/lib/rooms';
import type { IMeetingRoom } from '@/services';
import {
  EmptyState,
  ErrorState,
  ISegmentedOption,
  SegmentedControl,
  Skeleton,
} from '../../base';
import { PageHeader } from '../../layout';
import { BookingSheet } from '../booking-sheet';
import { RoomCard } from '../room-card';

type TRoomFilter = `all` | `available`;

/**
 * Meeting rooms (`/rooms`): live state of every room, book-from-now, and
 * release / cancel of your own bookings.
 */
export const RoomsView: FC = () => {
  const now = useNow();
  const { data: rooms, isPending, isError, refetch, isFetching } = useRooms();
  const { data: profile } = useProfile();
  const [filter, setFilter] = useState<TRoomFilter>(`all`);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const viewerId = profile?.id ?? ``;
  const bookable = (room: IMeetingRoom) =>
    resolveRoomSnapshot(room.bookings, now, viewerId).state.canBook;
  const freeCount = rooms?.filter(bookable).length;
  const visible =
    rooms?.filter((room) => filter === `all` || bookable(room)) ?? [];
  // Look the room up by id so the sheet always sees the freshest bookings.
  const selectedRoom = rooms?.find((room) => room.id === selectedId) ?? null;

  const options: ISegmentedOption<TRoomFilter>[] = [
    { value: `all`, label: uiText.rooms.filterAll, count: rooms?.length },
    {
      value: `available`,
      label: uiText.rooms.filterAvailable,
      count: freeCount,
    },
  ];

  return (
    <>
      <PageHeader title={uiText.rooms.title} subtitle={uiText.rooms.subtitle} />

      <SegmentedControl
        aria-label={uiText.rooms.filterLabel}
        options={options}
        value={filter}
        onChange={setFilter}
        isFullWidth
        size="sm"
      />

      {isPending || !profile ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-busy>
          <Skeleton className="h-64 w-full rounded-24" />
          <Skeleton className="h-64 w-full rounded-24" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : visible.length === 0 ? (
        <EmptyState icon="door" title={uiText.rooms.empty} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((room) => (
            <li key={room.id}>
              <RoomCard
                room={room}
                viewerId={viewerId}
                onBook={(target) => {
                  setSelectedId(target.id);
                  setSheetOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <BookingSheet
        room={selectedRoom}
        viewerId={viewerId}
        isOpen={isSheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
};

RoomsView.displayName = `RoomsView`;

export default RoomsView;
