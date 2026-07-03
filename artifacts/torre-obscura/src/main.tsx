import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

// Service worker: SOMENTE em produção. Builds de produção do Vite usam nomes de
// arquivo com hash de conteúdo, então a estratégia cache-first do SW continua
// fresca a cada deploy. Em desenvolvimento os caminhos dos módulos são fixos, então
// um SW em cache serviria código velho para sempre — por isso, em dev, removemos
// qualquer SW existente e limpamos os caches dele.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed — app still works online
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()))
      .catch(() => {});
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
  }
}

createRoot(document.getElementById('root')!).render(<App />);
