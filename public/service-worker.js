const { response } = require("express");

const CACHE_NAME = 'static-cache-v1';

const iconSizes = ['192', '512'];
const iconFiles = iconsSizes.map((size) => `/icons/icon-${size}x${size}.png`);
const FILES_TO_CACHE = [
  "/",
  "/offline.html",
  '/manifest.webmanifest',
  '/index.js',
  '/styles.css'
].concat(iconFiles);
// Install event
// This will include adding registration code to the site JavaScript, requesting the service worker JS file, and calling an install event.
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(cache => cache.addAll(FILE_TO_CACHE))
    .then(() => self.skipWaiting())
  );
});
// Activate event
// This will run after a successful install event and page refresh. We can force the service worker to activate prior to the refresh with specific code.
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches
    .keys()
    .then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});
// Fetch event
// This will allow the capture of network requests prior to page load and is how we'll create offline pages for offline functionality. For example, when the site is online, the fetch event will capture assets and cache them. When the browser is offline, the fetch event will return results and content from the cache.

self.addEventListener("fetch", function(event) {
  if (event.request.url.incluedes("/api/") && event.request.method === "GET") {
    event.respondWith(
      caches
      .open(CACHE_NAME)
      .then(function(ache) {
        return fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(error => {
          return cache.match(event.request);
        });
      })
      .catch((error) => console.log(error))
    );
  } else {
    event.respondWith(
      caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
  }
});