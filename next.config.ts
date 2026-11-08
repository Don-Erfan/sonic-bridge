import { networkInterfaces } from 'node:os';
import type { NextConfig } from 'next';

/**
 * Every IPv4 address of this machine, so a phone on the same network can open
 * the dev server (e.g. `http://192.168.1.20:3000`). Next 16 blocks dev
 * resources (HMR) for any host but `localhost` by default, which leaves the
 * page broken on a real device.
 */
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((address) => address?.family === `IPv4` && !address.internal)
  .map((address) => address!.address);

/**
 * Next.js configuration, tuned for runtime and build performance.
 *
 * - **React Compiler** auto-memoises components and hooks, so `useMemo` /
 *   `useCallback` are not needed for render performance.
 * - **optimizePackageImports** makes the HeroUI / React Aria barrels resolve
 *   only the modules a file actually imports.
 * - **headers()** serves the service worker uncached (so an update is picked
 *   up on the next visit) and adds baseline security headers to every route.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  poweredByHeader: false,
  allowedDevOrigins: lanAddresses,
  images: {
    formats: [`image/avif`, `image/webp`],
  },
  experimental: {
    optimizePackageImports: [`@heroui/react`, `react-aria-components`],
  },
  async headers() {
    return [
      {
        source: `/(.*)`,
        headers: [
          { key: `X-Content-Type-Options`, value: `nosniff` },
          { key: `Referrer-Policy`, value: `strict-origin-when-cross-origin` },
          { key: `X-Frame-Options`, value: `DENY` },
          // Face recognition happens at the office entrance, never in the app.
          {
            key: `Permissions-Policy`,
            value: `camera=(), microphone=(), geolocation=()`,
          },
        ],
      },
      {
        // The Sonic Bridge test bench receives data over sound, so it is the
        // one page allowed to use the microphone (same-origin only). Listed
        // after the global rule: for the same key, the last match wins.
        source: `/sonic-test`,
        headers: [
          {
            key: `Permissions-Policy`,
            value: `camera=(), microphone=(self), geolocation=()`,
          },
        ],
      },
      {
        source: `/sw.js`,
        headers: [
          {
            key: `Content-Type`,
            value: `application/javascript; charset=utf-8`,
          },
          {
            key: `Cache-Control`,
            value: `no-cache, no-store, must-revalidate`,
          },
          { key: `Service-Worker-Allowed`, value: `/` },
        ],
      },
    ];
  },
};

export default nextConfig;
