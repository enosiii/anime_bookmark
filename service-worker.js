const CACHE_NAME = 'anime-bookmark-cache-v2';
const urlsToCache = [
    '/anime_bookmark/anime-bookmark/',
    '/anime_bookmark/anime-bookmark/index.html',
    '/anime_bookmark/styles.css',
    '/anime_bookmark/styles1.css',
    '/anime_bookmark/script.js',
    '/anime_bookmark/checkbox.css',
    '/anime_bookmark/abm192.png',
    '/anime_bookmark/abm512.png'
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

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME)
                          .map(cache => caches.delete(cache))
            );
        })
    );
});
