/* Suede service worker — makes the app installable and gives it a graceful
   offline fallback. Deliberately conservative: it does NOT cache JS/CSS bundles
   (whose hashes change every deploy) to avoid serving stale app code. It only
   caches the app shell for an offline navigation fallback. */
const CACHE = 'suede-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add('/')).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  // Network-first for page navigations; fall back to the cached shell offline.
  event.respondWith((async () => {
    try {
      const net = await fetch(req);
      const cache = await caches.open(CACHE);
      cache.put('/', net.clone()).catch(() => {});
      return net;
    } catch {
      const cache = await caches.open(CACHE);
      return (await cache.match('/')) || Response.error();
    }
  })());
});
