// NexoTrade Service Worker — v6 (SIN caché de app: siempre carga de la red; solo Push Notifications)

// Instalar: activar de inmediato la versión nueva
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activar: BORRAR TODAS las cachés viejas y tomar control de las pestañas abiertas
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));   // limpia todo lo cacheado antes
    await self.clients.claim();
  })());
});

// ⚠️ Sin handler 'fetch': todas las peticiones van DIRECTO a la red, sin caché del service worker.
// Así la app siempre muestra la última versión (no más versiones viejas pegadas).

// ── PUSH NOTIFICATIONS ────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'NexoTrade', body: '¡Hay novedades en el mercado!', icon: '/logo_nexo.png', url: '/' };
  try { data = { ...data, ...event.data.json() }; } catch (e) {}

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
      const existing = wins.find((w) => w.url.includes('nexotradeia.com'));
      if (existing) { existing.focus(); existing.navigate(url); }
      else clients.openWindow(url);
    })
  );
});
