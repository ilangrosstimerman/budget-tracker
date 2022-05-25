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
    caches.keys().then(function(keyList) {
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
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// self.addEventListener("fetch", function(event) {
//   const [url] = event.request;
//   if (url.includes("") || url.includes("")) {
//     event.respondWith(
//       caches.open(DATA_CACHE_NAME).then(cache => {
//         return fetch(event.request)
//         .then(response => {
//           // If the response was good, clone it and store it in the cache.
//           if (response.status === 200) {
//             cache.put(event.request, response.clone());
//           }
//           return response;
//         })
//         .catch(error => {
//           // Network request failed, try to get it from the cache.
//           return cache.match(event.request);
//         });
//       })
//       .catch(error => console.log(error))
//     );
//   } else {
//     // respond from static cache, request is not fro /api/*
//     event.respondWith(
//       caches.open(CACHE_NAME).then(cache => {
//         return cache.match(event.request).then(response => {
//           return response || fetch(event.request);
//         });
//       })
//     );
//   }
// });

// self.addEventListener("fetch", function(event) {
//   if (event.request.url.startsWith(self.location.origin)) {
//     event.respondWith(
//       caches.match(event.request).then((cachedResponse) => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }
//         return caches.open(RUNTIME).then((cache) => {
//           return fetch(event.request).then((response) => {
//             return cache.put(event.request, response.clone()).then(() => {
//               return response;
//             });
//           });
//         });
//       })
//     );
//   }
// });