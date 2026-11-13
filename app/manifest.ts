import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Modus Travel',
    short_name: 'Modus',
    description: 'Seu passaporte digital e roteiros de viagem',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#080d1a',
    theme_color: '#080d1a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}