self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Não intercepta rotas de API, RSC do Next.js nem domínios externos
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('_rsc')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => Response.error())
  );
});