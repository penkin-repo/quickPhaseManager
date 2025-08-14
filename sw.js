const CACHE_NAME = 'quick-phrases-cache-v2';
const DATA_CACHE_NAME = 'quick-phrases-data-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  // App shell and other core assets will be cached on first request
];

// Install the service worker and pre-cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened static asset cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ignore non-GET requests or requests to browser extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // API requests (to Supabase) use a network-first strategy
  if (requestUrl.pathname.startsWith('/rest/v1/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(networkResponse => {
            // If we get a valid response, cache it and return it
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // If the network fails, try to get the response from the cache
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // For all other requests (app shell), use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have a cached response, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network
        return fetch(event.request).then(networkResponse => {
          // Cache the new response for future use
          return caches.open(CACHE_NAME).then(cache => {
            if (networkResponse.ok) {
                 cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
  );
});
