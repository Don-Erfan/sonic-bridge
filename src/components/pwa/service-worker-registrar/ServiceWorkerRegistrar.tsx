'use client';
import { FC, useEffect } from 'react';
import { uiText } from '@/config';
import { installPromptStore, registerServiceWorker } from '@/lib/pwa';
import { notify } from '../../base';
import { IServiceWorkerRegistrarProps } from './interface';

// Touch the install store at module load so its `beforeinstallprompt`
// listener is attached as early as the client bundle runs.
installPromptStore.getSnapshot();

/**
 * Registers the service worker (offline shell, cached assets, push
 * notifications) and offers a reload when a new version is waiting — never
 * a surprise reload mid-task. Development registers the worker in dev mode
 * (push only, no caching), which replaces any worker left by a production
 * build on the same origin, so stale caches never mask code changes.
 * With `isEnabled={false}` every worker is removed.
 *
 * Renders nothing; mounted once by `Providers`.
 */
export const ServiceWorkerRegistrar: FC<IServiceWorkerRegistrarProps> = ({
  isEnabled = true,
}) => {
  useEffect(() => {
    if (!(`serviceWorker` in navigator)) return;

    if (!isEnabled) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        );
      return;
    }

    return registerServiceWorker((activate) => {
      notify.info(uiText.pwa.updateReady, {
        timeout: 0,
        action: { label: uiText.pwa.reload, onPress: activate },
      });
    });
  }, [isEnabled]);

  return null;
};

ServiceWorkerRegistrar.displayName = `ServiceWorkerRegistrar`;

export default ServiceWorkerRegistrar;
