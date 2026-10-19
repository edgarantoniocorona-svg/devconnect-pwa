// sw.js - Service Worker con Cache API y Estrategia Cache First

// 1. Definimos el nombre y la versión de la caché estática
const CACHE_NAME = 'mi-proyecto-pwa-v1';

// 2. Listamos todos los recursos estáticos esenciales que forman el App Shell
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// FASE DE INSTALACIÓN: Guardando recursos estáticos
self.addEventListener('install', event => {
    console.log('SW: Guardando recursos estáticos en la caché...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Caché abierta con éxito:', CACHE_NAME);
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('SW: Todos los archivos del App Shell fueron almacenados.');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('SW: Falló el almacenamiento en caché del App Shell:', err);
            })
    );
});

// FASE DE ACTIVACIÓN
self.addEventListener('activate', event => {
    console.log('SW: Activado y listo.');
    return self.clients.claim();
});

// FASE FETCH: Estrategia Cache First (Caché primero con respaldo en Red)
self.addEventListener('fetch', event => {
    // Interceptamos la respuesta HTTP
    event.respondWith(
        // 1. Buscamos si el recurso solicitado ya está guardado en la caché
        caches.match(event.request)
            .then(responseInCache => {
                // Si se encuentra en caché, lo devolvemos desde el disco local
                if (responseInCache) {
                    console.log('SW: Sirviendo desde Caché ->', event.request.url);
                    return responseInCache;
                } 

                // Si no está en caché, intentamos obtenerlo de la red (Internet)
                console.log('SW: No está en caché. Buscando en Red ->', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('SW: Error en fetch y recurso no disponible en caché:', error);
                // Opcional: Aquí podríamos retornar una página de fallback offline personalizada
            })
    );
});