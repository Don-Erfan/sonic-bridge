import { uiText } from '@/config';
import { RSVP_OPTIONS, TRsvp } from '@/lib/events';
import type { ISegmentedOption } from '../../base';

export const RSVP_SEGMENTS: readonly ISegmentedOption<TRsvp>[] =
  RSVP_OPTIONS.map((value) => ({ value, label: uiText.events.rsvp[value] }));
