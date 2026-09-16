/* Suede service worker — makes the app installable and gives it a graceful
   offline fallback. Deliberately conservative: it does NOT cache JS/CSS bundles
   (whose hashes change every deploy) to avoid serving stale app code. It only
   caches the app shell for an offline navigation fallback. */
const CACHE = 'suede-shell-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add('/')).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const old = keys.filter((k) => k !== CACHE);
    await Promise.all(old.map((k) => caches.delete(k)));
    await self.clients.claim();
    // If we deleted an older cache, this is an UPDATE (not a first install) —
    // so an installed PWA is currently showing old bundle code. Force each open
    // window to re-navigate into the fresh app. This does NOT depend on the
    // running page's JS, so it fixes PWAs stuck on a bundle that predates the
    // version-check logic in RegisterSW.
    if (old.length) {
      const clients = await self.clients.matchAll({ type: 'window' });
      await Promise.all(clients.map((c) => c.navigate(c.url).catch(() => {})));
    }
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
