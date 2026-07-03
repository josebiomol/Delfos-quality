/**
 * Service Worker - Agenda de Congelação (Delfos Quality)
 *
 * Estratégia:
 * - HTML: network-first (sempre busca a versão mais nova quando online,
 *   cai pro cache/offline quando não tem conexão).
 * - CSS/JS/ícones: stale-while-revalidate (responde rápido do cache e
 *   atualiza em segundo plano).
 * - Nunca intercepta chamadas pra fora do domínio (a API do Google Apps
 *   Script continua sempre indo direto pra rede, sem cache).
 */

const CACHE_NAME = 'delfos-shell-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/scrollbar-fix.css',
  './css/global.css',
  './css/components.css',
  './css/layout.css',
  './css/app.css',
  './css/responsive.css',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) => console.warn('⚠️ Falha ao pré-cachear alguns arquivos:', err))
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
  const req = event.request;
  const url = new URL(req.url);

  // Só GET do mesmo domínio. Chamadas pra API (Google Apps Script) e afins
  // são de outro domínio, então já ficam de fora automaticamente.
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  const isHTML = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
