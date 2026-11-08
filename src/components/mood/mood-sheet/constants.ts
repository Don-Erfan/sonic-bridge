import { uiText } from '@/config';
import {
  AVAILABILITIES,
  MOOD_EXPIRIES,
  TAvailability,
  TMoodExpiry,
} from '@/lib/mood';
import type { ISegmentedOption } from '../../base';

export const AVAILABILITY_OPTIONS: readonly ISegmentedOption<TAvailability>[] =
  AVAILABILITIES.map((value) => ({
    value,
    label: uiText.mood.availabilityOptions[value],
  }));

export const EXPIRY_OPTIONS: readonly ISegmentedOption<TMoodExpiry>[] =
  MOOD_EXPIRIES.map((value) => ({
    value,
    label: uiText.mood.expiryOptions[value],
  }));

/** A status most people set "for today". */
export const DEFAULT_EXPIRY: TMoodExpiry = `today`;
