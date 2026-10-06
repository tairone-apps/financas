// Guarda o app no celular para funcionar sem internet.
const CACHE = 'financas-v1';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Abre na hora pelo que está guardado; se tiver internet, atualiza a cópia em segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const daRede = fetch(e.request).then(r => { if (r && r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => null);
    if (guardado) { e.waitUntil(daRede); return guardado; }
    const r = await daRede;
    return r || (await cache.match('./index.html')) || new Response('Sem internet', { status: 503 });
  }));
});
