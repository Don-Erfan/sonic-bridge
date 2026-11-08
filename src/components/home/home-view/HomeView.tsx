'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import {
  useEvents,
  useNow,
  useProfile,
  useRooms,
  useStaff,
  useWalletSummary,
} from '@/hooks';
import { selectUpcomingEvents } from '@/lib/events';
import { countByPresence } from '@/lib/presence';
import { resolveRoomSnapshot } from '@/lib/rooms';
import { formatNumber } from '@/lib/utils';
import {
  CoinAmount,
  EmptyState,
  Section,
  Skeleton,
  StatTile,
} from '../../base';
import { CheckInCard } from '../../attendance';
import { EventCard } from '../../events/event-card';
import { MoodCard } from '../../mood';
import { Greeting } from '../greeting';

/** Upcoming events shown on the dashboard. */
const UPCOMING_LIMIT = 3;

const StatSkeleton = () => <Skeleton className="h-7 w-10 rounded-full" />;

/**
 * Dashboard (`/`): greeting, today's check-in and mood, the office at a
 * glance (who is in, free rooms, coins) and the next events.
 */
export const HomeView: FC = () => {
  const now = useNow();
  const { data: profile } = useProfile();
  const { data: staff } = useStaff();
  const { data: rooms } = useRooms();
  const { data: wallet } = useWalletSummary();
  const { data: events, isPending: isEventsPending } = useEvents();

  const inOffice = staff ? countByPresence(staff)[`in-office`] : null;
  const freeRooms =
    rooms && profile
      ? rooms.filter(
          (room) =>
            resolveRoomSnapshot(room.bookings, now, profile.id).state.canBook,
        ).length
      : null;
  const upcoming = events
    ? selectUpcomingEvents(events, now, UPCOMING_LIMIT)
    : [];
  const firstName = profile?.fullName.split(` `)[0] ?? ``;

  return (
    <>
      {profile ? (
        <Greeting name={firstName} />
      ) : (
        <div className="flex flex-col gap-2 px-1 pt-2" aria-busy>
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
      )}

      <CheckInCard />

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          icon="users"
          tone="success"
          label={uiText.home.inOfficeNow}
          href="/team"
          value={inOffice === null ? <StatSkeleton /> : formatNumber(inOffice)}
        />
        <StatTile
          icon="door"
          tone="info"
          label={uiText.home.roomsFree}
          href="/rooms"
          value={
            freeRooms === null ? <StatSkeleton /> : formatNumber(freeRooms)
          }
        />
        <StatTile
          icon="wallet"
          tone="warning"
          label={uiText.home.myCoins}
          href="/wallet"
          value={
            wallet ? (
              <CoinAmount amount={wallet.balance} size="md" />
            ) : (
              <StatSkeleton />
            )
          }
        />
      </div>

      <MoodCard />

      <Section
        id="upcoming-events"
        title={uiText.home.upcomingEvents}
        action={{ label: uiText.seeAll, href: `/events` }}
      >
        {isEventsPending ? (
          <div className="flex flex-col gap-3" aria-busy>
            <Skeleton className="h-28 w-full rounded-24" />
            <Skeleton className="h-28 w-full rounded-24" />
          </div>
        ) : upcoming.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {upcoming.map((event) => (
              <li key={event.id}>
                <EventCard event={event} variant="compact" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="calendar" title={uiText.home.noUpcomingEvents} />
        )}
      </Section>
    </>
  );
};

HomeView.displayName = `HomeView`;

export default HomeView;
