/* Service worker — runtime caching only.
 *
 * Cache-first for:
 *   - hashed JS/CSS bundles: scripts/vendor.<hash>.js, scripts/scripts.<hash>.js, styles/main.<hash>.css
 *   - static images: /images/, /public/images/, /fonts/, /vendor-styles/
 *
 * Network-only for everything else (API calls, HTML, manifest).
 * Bumping CACHE_VERSION evicts old entries.
 */
const CACHE_VERSION = 'v1';
const STATIC_CACHE = 'static-' + CACHE_VERSION;
const IMAGE_CACHE = 'images-' + CACHE_VERSION;

const HASHED_ASSET = /\.[a-f0-9]{8,10}\.(?:js|css)$/;
const IMAGE_PATH = /\/(?:public\/)?(?:images|fonts|vendor-styles)\//;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== STATIC_CACHE && k !== IMAGE_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    if (HASHED_ASSET.test(url.pathname)) {
        event.respondWith(cacheFirst(req, STATIC_CACHE));
        return;
    }
    if (IMAGE_PATH.test(url.pathname)) {
        event.respondWith(cacheFirst(req, IMAGE_CACHE));
        return;
    }
});

function cacheFirst(req, cacheName) {
    return caches.open(cacheName).then((cache) =>
        cache.match(req).then((hit) => {
            if (hit) return hit;
            return fetch(req).then((resp) => {
                if (resp && resp.status === 200 && resp.type === 'basic') {
                    cache.put(req, resp.clone());
                }
                return resp;
            });
        })
    );
}
