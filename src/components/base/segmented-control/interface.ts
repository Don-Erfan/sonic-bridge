import { TIconName } from '@/icons';

export interface ISegmentedOption<TValue extends string> {
  value: TValue;
  label: string;
  icon?: TIconName;
  /** Optional count shown after the label (e.g. people in each state). */
  count?: number;
}

export interface ISegmentedControlProps<TValue extends string> {
  options: readonly ISegmentedOption<TValue>[];
  /** `null` = nothing chosen yet (e.g. an unanswered invitation). */
  value: TValue | null;
  onChange: (value: TValue) => void;
  /** Names the group for assistive technology. */
  'aria-label': string;
  /** Options share the full width (≤ 3 short options on mobile). */
  isFullWidth?: boolean;
  isDisabled?: boolean;
  size?: `sm` | `md`;
}
