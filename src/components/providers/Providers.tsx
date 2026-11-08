'use client';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { I18nProvider, RouterProvider } from '@heroui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query';
import { themeStore } from '@/lib/theme';
import { Toaster } from '../base';
import { ServiceWorkerRegistrar } from '../pwa';
import { IProvidersProps } from './interface';

/**
 * Client-side provider tree, mounted once by the root layout.
 *
 * - **I18nProvider** pins React Aria (and so HeroUI) to the app locale.
 * - **RouterProvider** routes HeroUI / React Aria links through Next.
 * - **QueryClientProvider** shares one cache (per request on the server, a
 *   Singleton in the browser).
 * - The theme store is connected here so `system` mode follows the OS.
 * - `Toaster` renders the toast region; `ServiceWorkerRegistrar` sets up
 *   the PWA's offline support.
 */
export const Providers: FC<PropsWithChildren<IProvidersProps>> = ({
  children,
  locale,
}) => {
  const router = useRouter();
  const [queryClient] = useState(getQueryClient);

  useEffect(() => themeStore.connect(), []);

  return (
    <I18nProvider locale={locale}>
      <RouterProvider navigate={router.push}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
          <ServiceWorkerRegistrar />
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        </QueryClientProvider>
      </RouterProvider>
    </I18nProvider>
  );
};

Providers.displayName = `Providers`;

export default Providers;
