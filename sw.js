const CACHE_NAME = 'coach-cache-v21';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './data/exercises.js',
  './data/descriptions.js',
  './js/profile.js',
  './js/generator.js',
  './js/workout.js',
  './js/exercise-help.js',
  './js/sounds.js',
  './js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
