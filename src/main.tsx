import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

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
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que Chrome muestre automáticamente el prompt
  e.preventDefault();
  // Guardar el evento para usarlo después
  deferredPrompt = e;
  
  console.log('📱 PWA puede ser instalada');
  
  // Aquí podrías mostrar tu propio botón de instalación
  showInstallButton();
});

function showInstallButton() {
  // Crear botón de instalación personalizado
  const installButton = document.createElement('button');
  installButton.innerHTML = '📱 Instalar App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transition: all 0.3s ease;
  `;
  
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px)';
    installButton.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0)';
    installButton.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
  });
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`👤 Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
      
      // Limpiar el prompt
      deferredPrompt = null;
      installButton.remove();
    }
  });
  
  // Agregar el botón al DOM después de que la app esté cargada
  setTimeout(() => {
    document.body.appendChild(installButton);
  }, 3000);
}

// Detectar cuando la app fue instalada
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalada exitosamente');
  
  // Remover el botón de instalación si existe
  const installButton = document.querySelector('button[innerHTML*="Instalar App"]');
  if (installButton) {
    installButton.remove();
  }
  
  // Aquí podrías trackear la instalación en analytics
  // analytics.track('pwa_installed');
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
