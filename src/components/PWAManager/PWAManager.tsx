import { useState, useEffect } from 'react';
import { Smartphone, Download, Wifi, WifiOff } from 'lucide-react';
import styles from './PWAManager.module.css';

interface PWAManagerProps {
  showInstallPrompt?: boolean;
}

export const PWAManager = ({ showInstallPrompt = true }: PWAManagerProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detectar si la app ya está instalada
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isRunningFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isRunningMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

    setIsInstalled(isRunningStandalone || isRunningFullscreen || isRunningMinimalUI);

    // Escuchar eventos de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó la instalación');
      } else {
        console.log('❌ Usuario rechazó la instalación');
      }

      // Limpiar el prompt
      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('Error al instalar PWA:', error);
    }
  };

  return (
    <>
      {/* Botón de instalación discreto - pequeño y no invasivo */}
      {canInstall && showInstallPrompt && !isInstalled && (
        <button
          onClick={handleInstall}
          className={styles.installButtonSmall}
          aria-label="Instalar aplicación"
          title="Instalar Gastos Hormigas como app"
        >
          <Download size={16} />
        </button>
      )}
    </>
  );
};
