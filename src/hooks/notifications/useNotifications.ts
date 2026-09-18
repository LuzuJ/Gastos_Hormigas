import { useState, useCallback, useRef } from 'react';

export interface Notification {
  id: number | string;
  message: string;
  type: 'warning' | 'danger' | 'success' | 'info'; // Warning for 90%, Danger for 100%+, Success for confirmations, Info for general
  customId?: string; // ID personalizado para notificaciones especiales (ej: gastos fijos)
}

import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idCounter = useRef(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    setNotifications(prev => {
      // Evita añadir mensajes idénticos repetidamente
      const exists = prev.some(n => n.message === notification.message);
      if (!exists) {
        idCounter.current += 1;
        const newNotification: Notification = {
          ...notification,
          id: notification.customId || idCounter.current
        };

        // Trigger Toast for urgent messages
        if (notification.type === 'danger') {
          toast.error(notification.message, { duration: 5000 });
        } else if (notification.type === 'warning') {
          toast(notification.message, { icon: '⚠️', duration: 4000 });
        } else if (notification.type === 'success') {
          toast.success(notification.message);
        }

        return [...prev, newNotification];
      }
      return prev;
    });
  }, []);

  const removeNotification = useCallback((id: number | string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const removeNotificationByCustomId = useCallback((customId: string) => {
    setNotifications(prev => prev.filter(n => n.customId !== customId));
  }, []);

  return { notifications, addNotification, removeNotification, removeNotificationByCustomId };
};