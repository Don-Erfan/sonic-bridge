'use client';
import React, { FC } from 'react';
import { fillTemplate, uiText } from '@/config';
import { useNow, useRespondToEvent } from '@/hooks';
import { Icon } from '@/icons';
import { eventCategoryRegistry, isEventLive, isEventOver } from '@/lib/events';
import { formatNumber, formatTimeRange } from '@/lib/utils';
import { Badge, notify, SegmentedControl, Surface } from '../../base';
import { RSVP_SEGMENTS } from './constants';
import { IEventCardProps } from './interface';

/**
 * A company event: category, live state, time, place, head-count and — for
 * events that have not ended — the RSVP control (optimistic).
 *
 * @example
 * <EventCard event={event} />
 */
export const EventCard: FC<IEventCardProps> = ({ event, variant = `full` }) => {
  const now = useNow();
  const respond = useRespondToEvent();
  const category = eventCategoryRegistry[event.category];
  const isLive = isEventLive(event, now);
  const isOver = isEventOver(event, now);
  const isCompact = variant === `compact`;
  const titleId = `event-${event.id}-title`;

  return (
    <Surface
      as="article"
      padding={isCompact ? `md` : `lg`}
      elevation={isCompact ? `sm` : `md`}
      aria-labelledby={titleId}
      className={isOver ? `opacity-75` : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={category.tone} icon={category.icon}>
          {uiText.events.categories[event.category]}
        </Badge>
        {isLive && (
          <Badge tone="danger" hasDot isPulsing>
            {uiText.events.happeningNow}
          </Badge>
        )}
      </div>

      <h3 id={titleId} className="mt-3 typo-s1 text-fg-primary">
        {event.title}
      </h3>

      <dl className="mt-2 flex flex-col gap-1.5 typo-b2 text-fg-secondary">
        <div className="flex items-center gap-2">
          <dt className="sr-only">{uiText.events.time}</dt>
          <Icon name="clock" size={16} className="text-fg-tertiary" />
          <dd>
            {event.isAllDay
              ? uiText.events.allDay
              : formatTimeRange(event.startsAt, event.endsAt)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">{uiText.events.location}</dt>
          <Icon name="map-pin" size={16} className="text-fg-tertiary" />
          <dd>{event.location}</dd>
        </div>
        {!isCompact && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">{uiText.events.attendeesLabel}</dt>
            <Icon name="users" size={16} className="text-fg-tertiary" />
            <dd>
              {fillTemplate(uiText.events.attendees, {
                count: formatNumber(event.attendeesCount),
              })}
            </dd>
          </div>
        )}
      </dl>

      {!isCompact && (
        <p className="mt-3 line-clamp-3 typo-b2 text-fg-tertiary">
          {event.description}
        </p>
      )}

      {!isCompact && !isOver && (
        <div className="mt-4">
          <SegmentedControl
            aria-label={`${uiText.events.rsvpLabel}: ${event.title}`}
            options={RSVP_SEGMENTS}
            value={event.myRsvp}
            onChange={(rsvp) =>
              respond.mutate(
                { eventId: event.id, rsvp },
                { onError: (error) => notify.error(error) },
              )
            }
            isFullWidth
            size="sm"
          />
        </div>
      )}
    </Surface>
  );
};

EventCard.displayName = `EventCard`;

export default EventCard;
