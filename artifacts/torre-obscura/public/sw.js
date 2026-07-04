const CACHE_NAME = 'torre-obscura-v3';

// Assets to pre-cache on install (app shell)
const PRECACHE_URLS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests from same origin
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigation requests: network-first so the user always gets updates
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match('/') || caches.match(event.request))
    );
    return;
  }

  // Chamadas de API nunca devem ser respondidas com cache: dados de aliança,
  // caixa, perfil etc. mudam a cada poll e o `cache: 'no-store'` do fetch do
  // client não tem efeito aqui (o SW intercepta antes da camada de cache HTTP).
  // Sem este bypass, a primeira resposta de uma URL de API (ex.: lista de
  // aliadas vazia antes de parear) fica presa no cache pra sempre.
  if (url.pathname.startsWith('/api/')) return;

  // Static assets (JS, CSS, fonts, images): cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      });
    })
  );
});