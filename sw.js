/* =========================================================
   Lead Manager • Service Worker
   - Static assets (HTML/CSS/JS/fonts/img) → Cache First
   - APIs do Google (login, sheets) → Network Only
   - Navegação (index.html) → Network First com fallback
   ========================================================= */

const CACHE_VERSION = 'leadmanager-v2.2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/chota.css',
    './assets/css/chota-base.css',
    './assets/css/chota-grid.css',
    './assets/css/chota-form.css',
    './assets/css/chota-nav.css',
    './assets/css/chota-card.css',
    './assets/css/chota-tab.css',
    './assets/css/chota-tag.css',
    './assets/css/chota-dropdown.css',
    './assets/css/chota-util.css',
    './assets/css/styles.css',
    './assets/js/app.js',
    './assets/js/pwa.js',
    './assets/img/logo.svg',
    './assets/img/lead-manager-192.png',
    './assets/img/lead-manager-512.png'
];

// Nunca cachear (APIs do Google)
const NEVER_CACHE = [
    'accounts.google.com',
    'script.google.com',
    'sheets.googleapis.com',
    'www.googleapis.com',
    'oauth2.googleapis.com'
];

// ---------- INSTALL ----------
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando…');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS).catch((err) => {
                console.warn('[SW] Falha ao pré-cachear:', err);
            }))
            .then(() => self.skipWaiting())
    );
});

// ---------- ACTIVATE ----------
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando…');
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((k) => !k.startsWith(CACHE_VERSION))
                .map((k) => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// ---------- FETCH ----------
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // Nunca cacheia APIs do Google
    if (NEVER_CACHE.some((host) => url.hostname.includes(host))) {
        return;
    }

    // Navegação → Network First com fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Fonts do Google → Cache First
    if (url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(request).then((cached) => cached || fetch(request).then((response) => {
                const copy = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                return response;
            }))
        );
        return;
    }

    // Assets do próprio domínio → Cache First
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }
                    const copy = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
                    return response;
                }).catch(() => {
                    if (request.mode === 'navigate') return caches.match('./index.html');
                });
            })
        );
        return;
    }

    // Fallback geral
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

// ---------- MESSAGE ----------
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
