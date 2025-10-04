const cacheName = 'tcwr-v1';
const filesToCache = [
  
  '/index.html',
  '/Espnprimetime.m4a',
  '/cheering.mp3',
  '/ESPNprimetime.m4a',
  '/cheering.mp3',
  '/crowd-shouting-6325.mp3',
  '/crowd-cheers-31833.mp3',
  '/disappointment.mp3',
  '/tcwr-512.png',
  '/tcwr-192.png',
  

  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    }).catch((error) => {
      console.error('Failed to cache resources:', error);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});