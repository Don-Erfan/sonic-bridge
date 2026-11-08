import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import { PropsWithChildren } from 'react';
import { Providers } from '@/components';
import { siteConfig } from '@/config';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

/**
 * Vazirmatn — an open-source Persian variable font with Latin glyphs,
 * self-hosted by `next/font` at build time (no runtime request to Google)
 * and exposed as `--font-vazirmatn` (see `typography.css`).
 */
// next/font options must be plain literals (no template literals).
const appFont = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: `default`,
  },
  formatDetection: {
    telephone: false,
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: `device-width`,
  initialScale: 1,
  // Draw under the notch / home indicator; layouts pad with safe-area insets.
  viewportFit: `cover`,
  colorScheme: `light dark`,
  themeColor: [
    {
      media: `(prefers-color-scheme: light)`,
      color: siteConfig.themeColor.light,
    },
    {
      media: `(prefers-color-scheme: dark)`,
      color: siteConfig.themeColor.dark,
    },
  ],
};

/**
 * Root layout (Server Component).
 *
 * The inline theme script runs before first paint and sets `.light` / `.dark`
 * on `<html>`, which is why `<html>` opts out of hydration attribute checks.
 */
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang={siteConfig.locale}
      dir={siteConfig.direction}
      className={appFont.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers locale={siteConfig.locale}>{children}</Providers>
      </body>
    </html>
  );
}
