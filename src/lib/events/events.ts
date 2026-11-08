import { startOfDay, toDayKey } from '../utils';
import {
  IEventCategoryDefinition,
  IEventDayGroup,
  IEventLike,
  TEventCategory,
  TEventFilter,
  TRsvp,
} from './interface';

export const RSVP_OPTIONS: readonly TRsvp[] = [`going`, `maybe`, `declined`];

/** Category registry (Flyweight). */
export const eventCategoryRegistry: Record<
  TEventCategory,
  IEventCategoryDefinition
> = {
  meeting: { category: `meeting`, icon: `users`, tone: `info` },
  celebration: { category: `celebration`, icon: `sparkles`, tone: `primary` },
  training: { category: `training`, icon: `presentation`, tone: `success` },
  offsite: { category: `offsite`, icon: `map-pin`, tone: `warning` },
  announcement: {
    category: `announcement`,
    icon: `megaphone`,
    tone: `neutral`,
  },
};

export const isEventLive = (event: IEventLike, now: Date): boolean =>
  new Date(event.startsAt) <= now && new Date(event.endsAt) > now;

export const isEventOver = (event: IEventLike, now: Date): boolean =>
  new Date(event.endsAt) <= now;

/**
 * Tab filters (Strategy). `now` is passed in, never read inside, so results
 * are deterministic and testable.
 */
export const eventFilters: Record<
  TEventFilter,
  (event: IEventLike, now: Date) => boolean
> = {
  upcoming: (event, now) => !isEventOver(event, now),
  going: (event, now) => !isEventOver(event, now) && event.myRsvp === `going`,
  past: (event, now) => isEventOver(event, now),
};

const byStartAsc = (a: IEventLike, b: IEventLike) =>
  a.startsAt - b.startsAt;

/**
 * Filters events and groups them into day sections — ascending for upcoming
 * tabs, most recent first for `past`.
 */
export const groupEventsByDay = <TEvent extends IEventLike>(
  events: readonly TEvent[],
  filter: TEventFilter,
  now: Date,
): IEventDayGroup<TEvent>[] => {
  const selected = events
    .filter((event) => eventFilters[filter](event, now))
    .toSorted(byStartAsc);
  if (filter === `past`) selected.reverse();

  const groups = new Map<string, IEventDayGroup<TEvent>>();
  for (const event of selected) {
    const date = startOfDay(new Date(event.startsAt));
    const dayKey = toDayKey(date);
    const group = groups.get(dayKey) ?? { dayKey, date, events: [] };
    group.events.push(event);
    groups.set(dayKey, group);
  }
  return [...groups.values()];
};

/** The next `limit` events that have not ended (home page). */
export const selectUpcomingEvents = <TEvent extends IEventLike>(
  events: readonly TEvent[],
  now: Date,
  limit: number,
): TEvent[] =>
  events
    .filter((event) => !isEventOver(event, now))
    .toSorted(byStartAsc)
    .slice(0, limit);
