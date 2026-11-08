'use client';
import React, { FC, useState } from 'react';
import { uiText } from '@/config';
import { useEvents, useNow } from '@/hooks';
import { groupEventsByDay, TEventFilter } from '@/lib/events';
import { calendarDaysBetween, formatLongDate } from '@/lib/utils';
import {
  EmptyState,
  ErrorState,
  ISegmentedOption,
  SegmentedControl,
  Skeleton,
} from '../../base';
import { PageHeader } from '../../layout';
import { EventCard } from '../event-card';

const FILTERS: readonly ISegmentedOption<TEventFilter>[] = [
  { value: `upcoming`, label: uiText.events.upcoming },
  { value: `going`, label: uiText.events.going },
  { value: `past`, label: uiText.events.past },
];

/** Day heading: "امروز" / "فردا" / weekday and date. */
const dayHeading = (date: Date, now: Date): string => {
  const days = calendarDaysBetween(now, date);
  if (days === 0) return `${uiText.events.today} · ${formatLongDate(date)}`;
  if (days === 1) return `${uiText.events.tomorrow} · ${formatLongDate(date)}`;
  return formatLongDate(date);
};

/**
 * Company events (`/events`) grouped by day, with RSVP on each upcoming
 * event.
 */
export const EventsView: FC = () => {
  const now = useNow();
  const { data: events, isPending, isError, refetch, isFetching } = useEvents();
  const [filter, setFilter] = useState<TEventFilter>(`upcoming`);
  const groups = events ? groupEventsByDay(events, filter, now) : [];

  return (
    <>
      <PageHeader
        title={uiText.events.title}
        subtitle={uiText.events.subtitle}
      />

      <SegmentedControl
        aria-label={uiText.events.filterLabel}
        options={FILTERS}
        value={filter}
        onChange={setFilter}
        isFullWidth
        size="sm"
      />

      {isPending ? (
        <div className="flex flex-col gap-4" aria-busy>
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-48 w-full rounded-24" />
          <Skeleton className="h-48 w-full rounded-24" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : groups.length === 0 ? (
        <EmptyState icon="calendar" title={uiText.events.empty} />
      ) : (
        groups.map((group) => (
          <section
            key={group.dayKey}
            aria-labelledby={`day-${group.dayKey}`}
            className="flex flex-col gap-3"
          >
            <h2
              id={`day-${group.dayKey}`}
              className="px-1 typo-s1 text-fg-tertiary"
            >
              {dayHeading(group.date, now)}
            </h2>
            <ul className="flex flex-col gap-4">
              {group.events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
};

EventsView.displayName = `EventsView`;

export default EventsView;
