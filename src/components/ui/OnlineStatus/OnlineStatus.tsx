import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import styles from './OnlineStatus.module.css';

export const OnlineStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div 
      className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}
      title={isOnline ? "Conectado" : "Sin conexión"}
    >
      {isOnline ? (
        <Wifi size={18} />
      ) : (
        <WifiOff size={18} />
      )}
    </div>
  );
};
