import { useSyncExternalStore } from 'react';
import { installPromptStore } from '@/lib/pwa';

/**
 * PWA install capability of this device and a `prompt()` to show the
 * browser's install dialog (Chromium). On iOS, `platform` is `ios` and the
 * UI explains "Add to Home Screen" instead.
 */
export const useInstallPrompt = () => {
  const snapshot = useSyncExternalStore(
    installPromptStore.subscribe,
    installPromptStore.getSnapshot,
    installPromptStore.getServerSnapshot,
  );
  return { ...snapshot, prompt: installPromptStore.prompt };
};
