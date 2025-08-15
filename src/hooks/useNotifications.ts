import { useState, useCallback } from 'react';

export interface Notification {
  id: number;
  message: string;
  type: 'warning' | 'danger'; // Warning for 90%, Danger for 100%+
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    // Evita añadir mensajes idénticos repetidamente
    const exists = notifications.some(n => n.message === notification.message);
    if (!exists) {
      setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
    }
  }, [notifications]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};