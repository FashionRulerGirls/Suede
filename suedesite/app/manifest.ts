import type { MetadataRoute } from 'next';

// Next serves this at /manifest.webmanifest — the PWA install manifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Suede — The Trust Layer for Fashion',
    short_name: 'Suede',
    description: 'Honest reviews from people who share your measurements. Discover minority-owned and emerging brands with confidence.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8F6F3',
    theme_color: '#14120F',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
