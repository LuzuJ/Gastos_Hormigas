import React, { createContext, useContext, type ReactNode } from 'react';
import { useNotifications } from '../hooks/notifications/useNotifications';

// Contexto global para notificaciones (se usa en toda la app)
const NotificationsContext = createContext<ReturnType<typeof useNotifications> | null>(null);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const notificationsData = useNotifications();

  return (
    <NotificationsContext.Provider value={notificationsData}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext debe ser usado dentro de NotificationsProvider');
  }
  return context;
};
