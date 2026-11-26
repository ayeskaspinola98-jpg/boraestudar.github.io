// Troque o número da versão a cada atualização do app para o celular baixar a nova.
const CACHE = 'bora-estudar-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Abre do cache na hora e atualiza em segundo plano. Funciona sem internet.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const ok = u.origin === location.origin || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!ok) return;
  e.respondWith(
    caches.match(r).then((hit) => {
      const net = fetch(r)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const cp = res.clone();
            caches.open(CACHE).then((c) => c.put(r, cp));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
