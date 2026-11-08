import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBrowserSubscription,
  getNotificationPermission,
  getPushBlocker,
  pushOwner,
  PUSH_RECEIVED_MESSAGE,
  subscribeBrowser,
  toSubscriptionPayload,
  TPushBlocker,
  unsubscribeBrowser,
  usesKey,
} from '@/lib/pwa';
import {
  announcementKeys,
  eventKeys,
  pushKeys,
  storeKeys,
  walletKeys,
} from '@/lib/query';
import { getErrorCode, pushService } from '@/services';
import { useProfile } from '../profile';

/**
 * Where notifications stand in this browser for the signed-in person.
 *
 * - `loading`: still checking.
 * - a `TPushBlocker`: this browser / page cannot receive them.
 * - `unavailable`: the server has no push keys configured.
 * - `denied`: the person blocked notifications for this site.
 * - `off` / `on`.
 */
export type TPushStatus =
  `loading` | TPushBlocker | `unavailable` | `denied` | `off` | `on`;

/** Thrown by `enable` when the person dismissed or blocked the prompt. */
export class PushPermissionError extends Error {
  constructor(readonly permission: NotificationPermission) {
    super(`Notification permission ${permission}`);
    this.name = `PushPermissionError`;
  }
}

/** The server's VAPID key; 409 `push_unavailable` is a state, not a failure. */
const usePushConfig = (isEnabled: boolean) =>
  useQuery({
    queryKey: pushKeys.config(),
    queryFn: () => pushService.getConfig(),
    enabled: isEnabled,
    staleTime: Infinity,
    retry: (count, error) =>
      getErrorCode(error) !== `push_unavailable` && count < 2,
  });

/** Browser facts that can only be read on the client. */
interface IBrowserState {
  blocker: TPushBlocker | null;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}

const readBrowserState = async (): Promise<IBrowserState> => {
  const blocker = getPushBlocker();
  if (blocker) return { blocker, permission: `default`, subscription: null };
  return {
    blocker,
    permission: getNotificationPermission(),
    subscription: await getBrowserSubscription().catch(() => null),
  };
};

/**
 * Notification opt-in for the profile page: the current status plus
 * `enable` (asks the browser for permission — call it straight from a tap)
 * and `disable`.
 *
 * "On" means this browser holds a subscription made with the server's
 * current key, by this person. The server binds it to the current sign-in
 * session, so signing out stops it (see `PushSync`).
 */
export const usePushNotifications = () => {
  const { data: profile } = useProfile();
  const [browser, setBrowser] = useState<IBrowserState | null>(null);

  const refresh = useCallback(() => readBrowserState().then(setBrowser), []);

  useEffect(() => {
    let isActive = true;
    const read = () =>
      void readBrowserState().then((state) => {
        if (isActive) setBrowser(state);
      });
    read();
    // Permission can change in the browser's site settings meanwhile.
    const onVisible = () => {
      if (document.visibilityState === `visible`) read();
    };
    document.addEventListener(`visibilitychange`, onVisible);
    return () => {
      isActive = false;
      document.removeEventListener(`visibilitychange`, onVisible);
    };
  }, []);

  const config = usePushConfig(browser !== null && browser.blocker === null);

  const enableMutation = useMutation({
    mutationFn: async (permissionRequest: Promise<NotificationPermission>) => {
      if (!profile) throw new Error(`Profile not loaded`);
      const permission = await permissionRequest;
      if (permission !== `granted`) throw new PushPermissionError(permission);
      const { publicKey } =
        config.data ?? (await config.refetch({ throwOnError: true })).data!;
      const subscription = await subscribeBrowser(publicKey);
      await pushService.subscribe(toSubscriptionPayload(subscription));
      pushOwner.set(profile.id);
    },
    onSettled: refresh,
  });

  /**
   * Turns notifications on. Call it directly from the tap handler: Safari
   * only shows its prompt when `requestPermission` runs synchronously inside
   * the user gesture, so it is started here, before anything is awaited.
   */
  const enable = () =>
    enableMutation.mutateAsync(Notification.requestPermission());

  const disableMutation = useMutation({
    mutationFn: async () => {
      pushOwner.clear();
      const subscription = await getBrowserSubscription();
      if (!subscription) return;
      // Server first (best effort): once the browser drops the subscription
      // its endpoint is gone and could no longer be named. Even if this
      // fails, unsubscribing the browser alone stops every notification:
      // the push service answers 410 and the server forgets it.
      await pushService
        .unsubscribe(subscription.endpoint)
        .catch(() => undefined);
      await subscription.unsubscribe();
    },
    onSettled: refresh,
  });

  const status = ((): TPushStatus => {
    if (!browser) return `loading`;
    if (browser.blocker) return browser.blocker;
    if (getErrorCode(config.error) === `push_unavailable`) return `unavailable`;
    if (browser.permission === `denied`) return `denied`;
    if (!config.data || !profile) return config.isError ? `off` : `loading`;
    const isOn =
      browser.permission === `granted` &&
      browser.subscription !== null &&
      usesKey(browser.subscription, config.data.publicKey) &&
      pushOwner.get() === profile.id;
    return isOn ? `on` : `off`;
  })();

  const sendTest = useMutation({
    mutationFn: () => pushService.sendTest(),
    // The test may find dead registrations (removed): re-read the browser.
    onSettled: refresh,
  });

  return {
    status,
    enable,
    sendTest,
    disable: () => disableMutation.mutateAsync(),
    isPending: enableMutation.isPending || disableMutation.isPending,
  };
};

/**
 * Keeps this browser's notifications consistent with who is signed in;
 * mounted once in the signed-in app shell.
 *
 * - The person who turned them on signs in (again): the subscription is
 *   (re)registered with the server for this new session, recreated if the
 *   server's key changed or signing out removed it.
 * - Someone else signs in on this device: the previous person's
 *   subscription is removed, so their notifications never show here.
 * - A notification arrives while the app is open: orders, wallet, events
 *   and announcements refresh, so the page shows the news at once.
 */
export const usePushSync = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const profileId = profile?.id;

  useEffect(() => {
    if (!profileId || getPushBlocker()) return;
    let isCancelled = false;

    void (async () => {
      const owner = pushOwner.get();
      if (owner === null) return;
      if (owner !== profileId) {
        pushOwner.clear();
        await unsubscribeBrowser();
        return;
      }
      if (getNotificationPermission() !== `granted`) return;
      const { publicKey } = await queryClient.fetchQuery({
        queryKey: pushKeys.config(),
        queryFn: () => pushService.getConfig(),
        staleTime: Infinity,
      });
      if (isCancelled) return;
      const subscription = await subscribeBrowser(publicKey);
      await pushService.subscribe(toSubscriptionPayload(subscription));
    })().catch(() => {
      // Best effort: the profile page shows the real status and lets the
      // person turn notifications on again.
    });

    return () => {
      isCancelled = true;
    };
  }, [profileId, queryClient]);

  useEffect(() => {
    if (!(`serviceWorker` in navigator)) return;
    const onMessage = (event: MessageEvent<unknown>) => {
      const data = event.data as { type?: unknown } | null;
      if (data?.type !== PUSH_RECEIVED_MESSAGE) return;
      void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
      void queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    };
    navigator.serviceWorker.addEventListener(`message`, onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener(`message`, onMessage);
  }, [queryClient]);
};

/**
 * Removes this browser's subscription before signing out (best effort), so
 * nothing addressed to this session can show on the device afterwards. The
 * opt-in (`pushOwner`) is kept: the same person signing in again gets
 * notifications back without being asked.
 */
export const releasePushSubscription = async (): Promise<void> => {
  if (getPushBlocker()) return;
  try {
    const subscription = await getBrowserSubscription();
    if (!subscription) return;
    await pushService.unsubscribe(subscription.endpoint).catch(() => undefined);
    await subscription.unsubscribe();
  } catch {
    // The server drops this session's subscriptions on sign-out anyway.
  }
};
