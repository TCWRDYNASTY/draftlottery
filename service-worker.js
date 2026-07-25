const CACHE_NAME = 'tcwr-v2';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './tcwr-512.png',
  './tcwr-192.png'
];

// Install and cache only files that successfully load.
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing.');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        for (const asset of CORE_ASSETS) {
          try {
            const response = await fetch(asset, {
              cache: 'no-store'
            });

            if (response.ok) {
              await cache.put(asset, response.clone());
              console.log(`[Service Worker] Cached: ${asset}`);
            } else {
              console.warn(
                `[Service Worker] Skipped ${asset}: HTTP ${response.status}`
              );
            }
          } catch (error) {
            console.warn(
              `[Service Worker] Could not cache ${asset}:`,
              error
            );
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// Remove older caches.
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating.');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log(
                `[Service Worker] Deleting old cache: ${cacheName}`
              );

              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Use network-first for pages so updated deployments appear immediately.
// Use cache-first for images and other local assets.
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Let external resources such as Supabase load normally.
  if (url.origin !== self.location.origin) {
    return;
  }

  const isHTMLRequest =
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html');

  if (isHTMLRequest) {
    event.respondWith(
      fetch(request, {
        cache: 'no-store'
      })
        .then(response => {
          if (response.ok) {
            const responseCopy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseCopy));
          }

          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }

          const homePage = await caches.match('./index.html');

          if (homePage) {
            return homePage;
          }

          return Response.error();
        })
    );

    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(response => {
            if (
              response.ok &&
              response.type === 'basic'
            ) {
              const responseCopy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, responseCopy));
            }

            return response;
          });
      })
  );
});
