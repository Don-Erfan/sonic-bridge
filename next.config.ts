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
/**
 * Where `/api/v1/*` is forwarded to (server-only, e.g. `http://localhost:5080`).
 * With it, the browser calls the API on the app's own origin
 * (`NEXT_PUBLIC_BASE_API=/api/v1`), so a phone that opened
 * `http://192.168.1.20:3000` reaches the API through this server — `localhost`
 * on a phone is the phone itself, and the API only listens on this machine.
 * Unset (e.g. an absolute `NEXT_PUBLIC_BASE_API` in production), nothing is
 * forwarded.
 */
const apiOrigin = process.env.API_ORIGIN?.replace(/\/+$/, ``);

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
    // Dev only. The debug channel streams React's debug info over the HMR
    // WebSocket into a WritableStream; on iOS Safari late chunks arrive after
    // the stream closed, flooding the terminal with "stream is closing or
    // closed". Off, the same debug info rides in the RSC payload instead.
    reactDebugChannel: false,
  },
  async rewrites() {
    return apiOrigin
      ? [
          {
            source: `/api/v1/:path*`,
            destination: `${apiOrigin}/api/v1/:path*`,
          },
        ]
      : [];
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
