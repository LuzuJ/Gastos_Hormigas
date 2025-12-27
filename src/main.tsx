import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { supabase } from './config/supabase'
import { userInitializationService } from './services/userInitializationService'
import { initSecurityChecks } from './utils/security'

// Exponer supabase y servicios globalmente para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  (window as any).supabase = supabase;
  (window as any).userInitializationService = userInitializationService;
  console.log('🔧 Debug mode: supabase y userInitializationService disponibles globalmente');

  // Cargar tests de endpoints en desarrollo
  import('./utils/testEndpoints').then((module) => {
    console.log('🧪 Tests de endpoints cargados. Usa testEndpoints() en consola para ejecutar.');
  });
}

// 🔒 Inicializar verificaciones de seguridad en producción
initSecurityChecks().catch(error => {
  console.error('🔴 Security checks failed:', error);
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('🎉 Service Worker registrado exitosamente:', registration.scope);

      // Escuchar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              console.log('🔄 Nueva versión de la app disponible');

              // Aquí podrías mostrar una notificación al usuario
              if (confirm('Nueva versión disponible. ¿Recargar la página?')) {
                window.location.reload();
              }
            }
          });
        }
      });

    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  });
}

// Manejar eventos de instalación de PWA
// Nota: El manejo del prompt de instalación se hace en el componente PWAManager.tsx
// para evitar duplicación de botones

// Detectar cuando la app fue instalada
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalada exitosamente');
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
