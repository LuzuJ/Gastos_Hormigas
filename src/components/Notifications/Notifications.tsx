import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import type { Notification } from '../../hooks/useNotifications';
import styles from './Notifications.module.css';

interface NotificationsProps {
  notifications: Notification[];
  onRemove: (id: number) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.bellButton}>
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {notifications.length === 0 ? (
            <p className={styles.emptyMessage}>No hay notificaciones nuevas.</p>
          ) : (
            <ul>
              {notifications.map(n => (
                <li key={n.id} className={styles[n.type]}>
                  <span>{n.message}</span>
                  <button onClick={() => onRemove(n.id)}><X size={14} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};