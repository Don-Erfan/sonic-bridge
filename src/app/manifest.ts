import type { MetadataRoute } from 'next';
import { siteConfig, uiText } from '@/config';

/**
 * Web App Manifest (served at `/manifest.webmanifest`): installable,
 * standalone, right-to-left, with home-screen shortcuts to the most used
 * screens. Icons are generated from the Ozone logo (`public/icons`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `/`,
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    lang: siteConfig.locale,
    dir: siteConfig.direction,
    start_url: `/`,
    scope: `/`,
    display: `standalone`,
    orientation: `portrait`,
    background_color: siteConfig.themeColor.light,
    theme_color: siteConfig.themeColor.light,
    categories: [`business`, `productivity`],
    icons: [
      {
        src: `/icons/icon-192.png`,
        sizes: `192x192`,
        type: `image/png`,
        purpose: `any`,
      },
      {
        src: `/icons/icon-512.png`,
        sizes: `512x512`,
        type: `image/png`,
        purpose: `any`,
      },
      {
        src: `/icons/maskable-512.png`,
        sizes: `512x512`,
        type: `image/png`,
        purpose: `maskable`,
      },
    ],
    shortcuts: [
      {
        name: uiText.nav.rooms,
        url: `/rooms`,
        icons: [{ src: `/icons/icon-192.png`, sizes: `192x192` }],
      },
      {
        name: uiText.nav.team,
        url: `/team`,
        icons: [{ src: `/icons/icon-192.png`, sizes: `192x192` }],
      },
      {
        name: uiText.nav.store,
        url: `/store`,
        icons: [{ src: `/icons/icon-192.png`, sizes: `192x192` }],
      },
    ],
  };
}
