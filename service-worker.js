const CACHE_NAME = 'tiddeli-pwa-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/css/tailwind.output.css',
    '/js/pwa.js',
    '/js/drawer/utils.js',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets:', ASSETS_TO_CACHE);
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // For development, always fetch from network first
    if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // For module files, don't cache them in development
                    if (event.request.url.endsWith('.js')) {
                        return response;
                    }
                    // For other files, cache them
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(error => {
                    console.error('Fetch failed:', error);
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For production, try cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a success response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // Clone the response
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        return new Response('Network error occurred', { status: 500 });
                    });
            })
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    // Close the notification
    event.notification.close();

    // Handle notification actions
    if (event.action === 'accept') {
        console.log('Accept action clicked');
        // You can add custom logic here for the accept action
    } else if (event.action === 'reject') {
        console.log('Reject action clicked');
        // You can add custom logic here for the reject action
    }

    // Focus the window
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
}); 