import { useState, useCallback, useRef } from 'react';

export interface Notification {
  id: number;
  message: string;
  type: 'warning' | 'danger' | 'success' | 'info'; // Warning for 90%, Danger for 100%+, Success for confirmations, Info for general
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idCounter = useRef(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    setNotifications(prev => {
      // Evita añadir mensajes idénticos repetidamente
      const exists = prev.some(n => n.message === notification.message);
      if (!exists) {
        idCounter.current += 1;
        return [...prev, { ...notification, id: idCounter.current }];
      }
      return prev;
    });
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};