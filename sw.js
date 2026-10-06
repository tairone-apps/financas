// Guarda o app no aparelho para funcionar sem internet.
const CACHE = 'financas-v4b';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Com internet: busca a versão mais nova. Sem internet: usa a cópia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  e.respondWith(
    fetch(e.request, {cache: 'no-store'})
      .then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(isPage ? './index.html' : e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(isPage ? './index.html' : e.request, {ignoreSearch: true})
        .then(r => r || caches.match('./index.html')))
  );
});
