// Service Worker para PWA - Gastos Hormigas
const CACHE_NAME = 'gastos-hormigas-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Recursos críticos para cachear
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // CSS y JS se agregan dinámicamente durante el build
];

// Recursos de la API para cachear
const API_CACHE_PATTERNS = [
  /^https:\/\/firestore\.googleapis\.com/,
  /^https:\/\/.*\.firebaseapp\.com/,
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network First: Para datos dinámicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: Para recursos que pueden cambiar
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Eventos del Service Worker

// Instalación
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando recursos críticos');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación:', error);
      })
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Eliminando cache obsoleto:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Estrategia para navegación (páginas HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Estrategia para recursos estáticos (JS, CSS, imágenes)
  if (isStaticResource(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia para API calls
  if (isAPICall(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estrategia por defecto: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Funciones de estrategias de cache

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First error:', error);
    return new Response('Recurso no disponible offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('❌ Network First error:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({
      error: 'No hay conexión y no hay datos en cache',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || networkPromise;
}

// Funciones helper

function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPICall(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href)) ||
         url.pathname.includes('/api/');
}

// Eventos de background sync para sincronización offline
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
  
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncPendingExpenses());
  }
  
  if (event.tag === 'sync-categories') {
    event.waitUntil(syncPendingCategories());
  }
});

// Funciones de sincronización
async function syncPendingExpenses() {
  try {
    // Aquí implementarías la lógica para sincronizar gastos pendientes
    console.log('💰 Sincronizando gastos pendientes...');
    
    // Obtener datos pendientes del IndexedDB
    const pendingExpenses = await getPendingExpenses();
    
    for (const expense of pendingExpenses) {
      try {
        await syncExpenseToFirestore(expense);
        await removePendingExpense(expense.id);
      } catch (error) {
        console.error('Error sincronizando gasto:', error);
      }
    }
    
    console.log('✅ Sincronización de gastos completada');
  } catch (error) {
    console.error('❌ Error en sincronización de gastos:', error);
  }
}

async function syncPendingCategories() {
  try {
    console.log('📂 Sincronizando categorías pendientes...');
    // Implementar lógica similar para categorías
  } catch (error) {
    console.error('❌ Error en sincronización de categorías:', error);
  }
}

// Funciones placeholder para IndexedDB (implementar según necesidad)
async function getPendingExpenses() {
  // Implementar lectura de IndexedDB
  return [];
}

async function syncExpenseToFirestore(expense) {
  // Implementar sincronización con Firestore
}

async function removePendingExpense(expenseId) {
  // Implementar eliminación de IndexedDB
}

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Gastos Hormigas',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Gastos Hormigas', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Click en notificación:', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

console.log('🎉 Service Worker cargado correctamente');
