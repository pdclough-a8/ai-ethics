import type { APIRoute } from 'astro';
import { withBase } from '../scripts/paths';

// Web app manifest, generated at build time (rather than a static file in
// public/) so icon/start_url/scope paths can go through withBase() like
// every other hand-written path in this repo, instead of hardcoding
// "/ai-ethics" a second place astro.config.mjs's `base` would need to stay
// in sync with. Astro prerenders this to a static /manifest.webmanifest
// file same as any other route (output: 'static').
export const GET: APIRoute = () => {
  const manifest = {
    id: withBase('/'),
    name: 'AI Ethics and Responsible AI',
    short_name: 'AI Ethics',
    description:
      'Analytics8 AI Ethics and Responsible AI course: the AI project lifecycle, from business understanding through deployment, with the ethical considerations at each stage.',
    start_url: withBase('/'),
    scope: withBase('/'),
    display: 'standalone',
    background_color: '#f2f2f2',
    theme_color: '#c24429',
    icons: [
      { src: withBase('/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/icon-192-maskable.png'), sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: withBase('/icons/icon-512-maskable.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};
