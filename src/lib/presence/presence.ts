import { normalizeForSearch } from '../utils';
import {
  IPresenceDefinition,
  IPresenceSubject,
  TPresenceFilter,
  TPresenceStatus,
} from './interface';

/** Every status, in display order. */
export const PRESENCE_STATUSES: readonly TPresenceStatus[] = [
  `in-office`,
  `remote`,
  `on-leave`,
  `out`,
];

/** Presence registry (Flyweight): one shared definition per status. */
export const presenceRegistry: Record<TPresenceStatus, IPresenceDefinition> = {
  'in-office': { status: `in-office`, tone: `success`, rank: 0 },
  remote: { status: `remote`, tone: `info`, rank: 1 },
  'on-leave': { status: `on-leave`, tone: `warning`, rank: 2 },
  out: { status: `out`, tone: `neutral`, rank: 3 },
};

/**
 * Team-list filters (Strategy): each key maps to an interchangeable
 * predicate, so adding a filter is a new entry — no `switch` to extend.
 */
export const presenceFilters: Record<
  TPresenceFilter,
  (subject: IPresenceSubject) => boolean
> = {
  all: () => true,
  'in-office': (subject) => subject.presence === `in-office`,
  'not-in-office': (subject) => subject.presence !== `in-office`,
};

const nameCollator = new Intl.Collator(`fa`);

/** In-office first, then remote, on leave, out; alphabetical within each. */
export const comparePresence = (
  a: IPresenceSubject,
  b: IPresenceSubject,
): number =>
  presenceRegistry[a.presence].rank - presenceRegistry[b.presence].rank ||
  nameCollator.compare(a.fullName, b.fullName);

/** Head-count per status (every status present, zero when empty). */
export const countByPresence = (
  subjects: readonly IPresenceSubject[],
): Record<TPresenceStatus, number> => {
  const counts: Record<TPresenceStatus, number> = {
    'in-office': 0,
    remote: 0,
    'on-leave': 0,
    out: 0,
  };
  for (const subject of subjects) counts[subject.presence] += 1;
  return counts;
};

/** Search across name, job title and team, tolerant of Persian spellings. */
export const matchesPresenceQuery = (
  subject: IPresenceSubject,
  query: string,
): boolean => {
  const needle = normalizeForSearch(query);
  if (!needle) return true;
  return [subject.fullName, subject.jobTitle, subject.team].some((field) =>
    normalizeForSearch(field).includes(needle),
  );
};

/** Filter + search + sort in one pass, for the team list. */
export const selectPresenceList = <TSubject extends IPresenceSubject>(
  subjects: readonly TSubject[],
  filter: TPresenceFilter,
  query: string,
): TSubject[] =>
  subjects
    .filter(
      (subject) =>
        presenceFilters[filter](subject) &&
        matchesPresenceQuery(subject, query),
    )
    .toSorted(comparePresence);
