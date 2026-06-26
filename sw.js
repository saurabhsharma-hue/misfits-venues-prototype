/* Misfits Venues prototype — service worker.
   Network-first (so updates always show when online), with cache fallback
   for offline / installed-PWA use. Bump CACHE to invalidate old caches. */
const CACHE = 'misfits-venues-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copy = resp.clone();
        if (resp && resp.status === 200) {
          caches.open(CACHE).then((c) => { try { c.put(e.request, copy); } catch (_) {} });
        }
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
