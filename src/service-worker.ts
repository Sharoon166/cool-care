/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const ASSETS = `cache${version}`;
const ASSET_URLS = [...build, ...files];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSETS).then((cache) => cache.addAll(ASSET_URLS)).then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => key !== ASSETS ? caches.delete(key) : Promise.resolve())))
      .then(() => sw.clients.claim())
  );
});

sw.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-only for SvelteKit data endpoints and API routes
  if (url.pathname.includes('/__data.json') || url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Pre-cached static assets: serve from cache
  if (ASSET_URLS.some((asset) => url.pathname === asset)) {
    event.respondWith(caches.match(request));
    return;
  }

  // Navigation pages: network-first, fallback to cache for offline support
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (fonts, images, etc.): network-only
  event.respondWith(fetch(request));
});
