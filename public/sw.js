// NexoTrade Service Worker — v1.0
const CACHE_NAME = 'nexotrade-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/logo2.png',
  '/logo_foro.jpg',
  '/favicon.svg',
  '/manifest.json',
];

// Instalar y cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: Network First, fallback a cache
self.addEventListener('fetch', (event) => {
  // Solo interceptar requests GET del mismo origen
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Para APIs externas (Supabase, Finnhub, OpenAI) — solo network
  const isExternalAPI = [
    'supabase.co',
    'finnhub.io',
    'openai.com',
    'giphy.com',
    'api.',
  ].some((domain) => event.request.url.includes(domain));

  if (isExternalAPI) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar en cache si es exitoso
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Si no hay red, usar cache
        return caches.match(event.request).then(
          (cached) => cached || caches.match('/index.html')
        );
      })
  );
});
