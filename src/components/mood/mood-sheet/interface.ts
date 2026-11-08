import type { TMoodKey } from '@/lib/mood';
import type { IMood } from '@/services';

export interface IMoodSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** The mood in effect, to prefill and to offer "clear". */
  currentMood: IMood | null;
  /** Mood pre-selected when opened from a quick-pick emoji. */
  initialKey?: TMoodKey | null;
  /** Whether a Mattermost account is linked (enables syncing). */
  canSync: boolean;
}
