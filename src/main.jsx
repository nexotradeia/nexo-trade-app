import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Ocultar el loader inicial del index.html cuando React monta
if (typeof window.__nexoLoaderHide === 'function') {
  window.__nexoLoaderHide();
} else {
  // Si React monta antes de que el script inline cargue
  window.addEventListener('load', () => {
    if (typeof window.__nexoLoaderHide === 'function') window.__nexoLoaderHide();
  });
}

// Registrar Service Worker para PWA (instalable en celular) + auto-actualización
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ NexoTrade PWA lista:', reg.scope);
        // Si encuentra una versión nueva, actívala de inmediato
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (nw) nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay versión nueva esperando → tomar control ya
              nw.postMessage && nw.postMessage('skipWaiting');
            }
          });
        });
        // Buscar actualizaciones cada vez que la pestaña vuelve a estar visible
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update();
        });
      })
      .catch(err => console.warn('SW error:', err));
  });
  // Cuando un SW nuevo toma control, recargar UNA vez para mostrar la última versión
  let _reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_reloaded) return;
    _reloaded = true;
    window.location.reload();
  });
}
