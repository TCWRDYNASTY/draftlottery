const CACHE_NAME = 'tcwr-v1'; 
const urlsToCache = [

  './', 
  'index.html',
  'manifest.json', 
  'service-worker.js',
  
  'tcwr-512.png',
  'tcwr-192.png',
  'ESPNprimetime.m4a', 
  'Espnprimetime.m4a', 
  'cheering.mp3',     
  'crowd-shouting-6325.mp3',
  'crowd-cheers-31833.mp3',
  'disappointment.mp3',

  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];


self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event received, beginning caching.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) 
      .catch((error) => {
        console.error('[Service Worker] Failed to cache resources:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        
        if (response) {
          return response;
        }
       
        return fetch(event.request);
      })
  );
});


self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  console.log('[Service Worker] Activate event received, cleaning up old caches.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
