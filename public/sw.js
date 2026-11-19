self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through simples exigido pelo Chrome para critérios de PWA
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});