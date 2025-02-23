// anime_bookmark/service-worker.js
const CACHE_NAME = 'unique-anime-bookmark-cache-v1';
const urlsToCache = [
    '/anime-bookmark/',
    '/anime-bookmark/index.html',
    '/styles.css',
    '/script.js',
    '/checkbox.css',
    '/abm192.png',
    '/abm512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});


