// Self-destructing service worker - clears all caches and unregisters
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Delete ALL caches
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
  // Unregister itself
  self.registration.unregister()
    .then(() => clients.claim());
});

// Don't cache anything - always fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
