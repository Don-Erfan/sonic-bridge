import { useState } from 'react';

/**
 * Runs an action that may return a promise and tracks its pending state.
 *
 * `run()` resolves `true` when the action succeeded and `false` when it threw,
 * so dialogs can close on success and stay open on failure. Report the error
 * inside the action itself (e.g. `notify.danger`).
 *
 * @example
 * const { isPending, run } = useAsyncAction(() => deleteChat.mutateAsync(id));
 * if (await run()) close();
 */
export const useAsyncAction = (action: () => void | Promise<void>) => {
  const [isPending, setPending] = useState(false);

  const run = async (): Promise<boolean> => {
    setPending(true);
    try {
      await action();
      return true;
    } catch {
      return false;
    } finally {
      setPending(false);
    }
  };

  return { isPending, run };
};
