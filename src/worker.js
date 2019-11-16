const CACHE_NAME = 'pinch_app';
const URLS_TO_CACHE = [
  "/",
  "/style.css",
  "/app.js",
  "/models.js"
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(resp) {
        if (resp) return resp;
        return fetch(event.request);
      })
  );
});
