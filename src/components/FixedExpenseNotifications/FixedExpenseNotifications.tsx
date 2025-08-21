import React from 'react';
import styles from './FixedExpenseNotifications.module.css';
import type { FixedExpenseNotification } from '../../hooks/useFixedExpenseNotifications';

interface FixedExpenseNotificationsProps {
  notifications: FixedExpenseNotification[];
  onDismiss?: (notificationId: string) => void;
  className?: string;
}

export const FixedExpenseNotifications: React.FC<FixedExpenseNotificationsProps> = ({
  notifications,
  onDismiss,
  className = ''
}) => {
  if (notifications.length === 0) {
    return null;
  }

  const getUrgencyLevel = (daysUntilDue: number): 'danger' | 'warning' | 'info' => {
    if (daysUntilDue <= 0) return 'danger';
    if (daysUntilDue === 1) return 'warning';
    return 'info';
  };

  const getUrgencyMessage = (daysUntilDue: number): string => {
    if (daysUntilDue < 0) return `Vencido hace ${Math.abs(daysUntilDue)} día(s)`;
    if (daysUntilDue === 0) return 'Vence hoy';
    if (daysUntilDue === 1) return 'Vence mañana';
    return `Vence en ${daysUntilDue} días`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  return (
    <div className={`${styles.notificationsContainer} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          📋 Recordatorios de Gastos Fijos
        </h3>
        <span className={styles.badge}>
          {notifications.length}
        </span>
      </div>

      <div className={styles.notificationsList}>
        {notifications.map((notification) => {
          const urgency = getUrgencyLevel(notification.daysUntilDue);
          const urgencyMessage = getUrgencyMessage(notification.daysUntilDue);

          return (
            <div
              key={notification.id}
              className={`${styles.notification} ${styles[urgency]}`}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <span className={styles.description}>
                    {notification.description}
                  </span>
                  <span className={styles.amount}>
                    {formatCurrency(notification.amount)}
                  </span>
                </div>

                <div className={styles.notificationDetails}>
                  <span className={styles.urgencyText}>
                    {urgencyMessage}
                  </span>
                  <span className={styles.dueDate}>
                    📅 {formatDate(notification.dueDate)}
                  </span>
                </div>
              </div>

              {onDismiss && (
                <button
                  type="button"
                  className={styles.dismissButton}
                  onClick={() => onDismiss(notification.fixedExpenseId)}
                  title="Descartar recordatorio"
                  aria-label="Descartar recordatorio"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {notifications.length > 3 && (
        <div className={styles.footer}>
          <span className={styles.footerText}>
            Mostrando {Math.min(3, notifications.length)} de {notifications.length} recordatorios
          </span>
        </div>
      )}
    </div>
  );
};
