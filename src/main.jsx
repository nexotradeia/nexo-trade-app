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

// Registrar Service Worker para PWA (instalable en celular)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ NexoTrade PWA lista:', reg.scope))
      .catch(err => console.warn('SW error:', err));
  });
}
