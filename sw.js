// Offline support: keeps a copy of the game's files on the phone, so it works without internet.
const CACHE = 'one-last-walk-v1';

const FILES = [
  './',
  './index.html',
  './style.css',
  './audio.js',
  './barnaby.js',
  './dialogue.js',
  './game.js',
  './maya-adult.js',
  './meadow-art.js',
  './meadow.js',
  './bench.js',
  './hill.js',
  './util.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Save the files when the game is first opened
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(FILES);
  }));
  self.skipWaiting();
});

// Remove copies saved by older versions
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (name) {
      return name !== CACHE;
    }).map(function (name) {
      return caches.delete(name);
    }));
  }));
  self.clients.claim();
});

// Use the internet when it is there, so updates arrive. Otherwise use the saved copy.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function (response) {
      const copy = response.clone();
      caches.open(CACHE).then(function (cache) {
        cache.put(event.request, copy);
      });
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
