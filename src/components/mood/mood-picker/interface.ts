import type { TMoodKey } from '@/lib/mood';

export interface IMoodPickerProps {
  value: TMoodKey | null;
  onChange: (value: TMoodKey) => void;
  /** Names the choice group. */
  'aria-label': string;
}
