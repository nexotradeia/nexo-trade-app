// NexoTrade Service Worker — v4.0 (Push + app siempre fresca)
const CACHE_NAME = 'nexotrade-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png',
  '/logo_nexo.png',
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

// ── PUSH NOTIFICATIONS ────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'NexoTrade', body: '¡Hay novedades en el mercado!', icon: '/logo_nexo.png', url: '/' };
  try { data = { ...data, ...event.data.json() }; } catch(e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo_nexo.png',
      badge: '/favicon.svg',
      tag: data.tag || 'nexotrade-notif',
      renotify: true,
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'Ver ahora →' },
        { action: 'close', title: 'Descartar' },
      ],
    })
  );
});

// Click en la notificación → abre el sitio
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const existing = wins.find(w => w.url.includes('nexotradeia.com'));
      if (existing) { existing.focus(); existing.navigate(url); }
      else clients.openWindow(url);
    })
  );
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

  // Navegaciones (el HTML de la app): SIEMPRE de la red para no servir una versión vieja.
  // El cache solo se usa como respaldo si el teléfono está sin internet.
  const isNav = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Resto (JS/CSS/imágenes con hash): red primero, cache de respaldo offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(
        (cached) => cached || caches.match('/index.html')
      ))
  );
});
