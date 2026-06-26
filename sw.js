/* Misfits Venues prototype — service worker.
   Cache-first with network fallback; caches everything on first fetch so the
   prototype works offline / installs as a PWA. */
const CACHE = 'misfits-venues-v1';

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
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((hit) =>
        hit || fetch(e.request).then((resp) => {
          try {
            if (resp && resp.status === 200) cache.put(e.request, resp.clone());
          } catch (_) {}
          return resp;
        }).catch(() => hit)
      )
    )
  );
});
