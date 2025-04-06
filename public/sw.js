const CACHE_NAME = 'codxai-v3';
const STATIC_CACHE_NAME = 'codxai-static-v3';
const DYNAMIC_CACHE_NAME = 'codxai-dynamic-v3';

// Assets that should be cached immediately during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/logo.png',
  '/logo-192.png',
  '/logo-384.png',
  '/logo-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  // Add core CSS and JS files that are needed for the app to function
  '/_next/static/css/app.css'
];

// Maximum items in dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 50;

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell and static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME && 
            cacheName !== DYNAMIC_CACHE_NAME && 
            cacheName.startsWith('codxai-')
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activated and controlling the page');
      return self.clients.claim();
    })
  );
});

// Helper function to limit the size of dynamic cache
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Delete older items
    await cache.delete(keys[0]);
    // Recursively trim until we're under the limit
    await trimCache(cacheName, maxItems);
  }
}

// Fetch event - network-first strategy for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // For navigation requests (HTML documents)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // For image requests
  if (event.request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // For static assets (JS, CSS)
  if (
    event.request.destination === 'script' || 
    event.request.destination === 'style' ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // Default: Stale-while-revalidate strategy
  event.respondWith(staleWhileRevalidate(event.request));
});

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    // Don't cache API responses - they change frequently
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Return default image for image requests
    if (request.destination === 'image') {
      return caches.match('/logo-192.png');
    }
    
    return new Response('Resource unavailable offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale-while-revalidate strategy (for other assets)
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(async networkResponse => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
        // Trim the dynamic cache to prevent it from growing too large
        trimCache(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS);
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('Failed to fetch:', error);
      return new Response('Network error', { status: 408 });
    });
  
  return cachedResponse || fetchPromise;
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic cache cleanup (once per day)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      Promise.all([
        trimCache(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS / 2)
      ])
    );
  }
}); 