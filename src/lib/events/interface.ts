import type { TIconName } from '@/icons';
import type { TTone } from '../tone';

export type TEventCategory =
  `meeting` | `celebration` | `training` | `offsite` | `announcement`;

/** The viewer's answer to an invitation. */
export type TRsvp = `going` | `maybe` | `declined`;

/** Events page tabs (Strategy keys). */
export type TEventFilter = `upcoming` | `going` | `past`;

export interface IEventCategoryDefinition {
  category: TEventCategory;
  icon: TIconName;
  tone: TTone;
}

/** Minimal event shape the helpers need. */
export interface IEventLike {
  startsAt: number;
  endsAt: number;
  myRsvp: TRsvp | null;
}

/** A day section of the events list. */
export interface IEventDayGroup<TEvent extends IEventLike> {
  dayKey: string;
  /** First instant of the day, for the section heading. */
  date: Date;
  events: TEvent[];
}
