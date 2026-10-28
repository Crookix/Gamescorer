// Network-first: always serve fresh files when online, fall back to the cache offline.
// Bump CACHE when the asset list changes; old caches (incl. scorekrew-v1) are purged on activate.
const CACHE = 'flip7-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=5',
  './app.js?v=5',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(r => r || caches.match(req, { ignoreSearch: true })).then(r =>
          r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())
        )
      )
  );
});
