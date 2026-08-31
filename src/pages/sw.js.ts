import type { APIRoute } from 'astro';
import { withBase } from '../scripts/paths';
import { bonusPages } from '../scripts/bonusPages';

// Service worker, generated at build time (same reasoning as
// manifest.webmanifest.ts) so it can precache base-prefixed URLs without
// hardcoding "/ai-ethics" separately from astro.config.mjs.
//
// Strategy:
//  - Page navigations: network-first, so anyone online always gets the
//    latest content; falls back to whatever's cached (or the cached home
//    page) when offline. Means offline use only works for pages already
//    visited once online - acceptable for a self-paced course, and why the
//    full page list is precached below on install rather than left to
//    happen opportunistically.
//  - Everything else (built JS/CSS, images, icons): cache-first with a
//    background refresh, since those change rarely and don't need to be
//    re-fetched on every visit.
//
// CORE_PAGES mirrors the page list hardcoded in Layout.astro (nav) and
// index.astro (menu grid) - see bonusPages.ts for why *that* list is
// shared via an import instead of also being copied by hand. A fourth copy
// here isn't ideal, but this file can't import a `pages` array the way the
// two .astro files could without also turning it into a bundled runtime
// dependency of the service worker for no real benefit.
const CORE_PAGES = [
  '/',
  '/introduction/',
  '/foundations/',
  '/business-understanding/',
  '/data-acquisition/',
  '/modeling/',
  '/deployment-beyond/',
  '/conclusion/',
];

export const GET: APIRoute = () => {
  const precacheUrls = [
    ...CORE_PAGES,
    ...bonusPages.map((p) => p.href),
    '/manifest.webmanifest',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/apple-touch-icon.png',
    '/assets/logo-analytics8.png',
  ].map((p) => withBase(p));

  const script = `// Auto-generated at build time by src/pages/sw.js.ts - do not edit dist/sw.js directly.

// Bump this on any deploy where already-installed visitors should drop
// their old cached content immediately rather than waiting for it to
// expire naturally via the cache-first/network-first logic below.
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'a8-ai-ethics-' + CACHE_VERSION;
const BASE = ${JSON.stringify(withBase('/'))};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('a8-ai-ethics-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(BASE)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
`;

  return new Response(script, {
    // Note: these headers only apply to the build-time response that
    // produces dist/sw.js - once deployed as a static file, GitHub Pages
    // serves it with its own headers (Content-Type inferred from the .js
    // extension), not these. Left here for local `astro preview` and in
    // case a future host respects it. A service worker's default scope is
    // the directory it's served from and everything below it - registering
    // it at withBase('/sw.js') (site root under the base path) already
    // covers every page here, so no Service-Worker-Allowed override is needed.
    headers: { 'Content-Type': 'application/javascript' },
  });
};
