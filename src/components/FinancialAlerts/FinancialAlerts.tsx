import React from 'react';
import { AlertTriangle, Bell, X, DollarSign, Calendar, TrendingDown } from 'lucide-react';
import { Button } from '../common';
import styles from './FinancialAlerts.module.css';
import { formatCurrency } from '../../utils/formatters';
import type { FinancialAlert } from '../../types';

interface FinancialAlertsProps {
  alerts: FinancialAlert[];
  onMarkAsRead: (alertId: string) => void;
  onDismissAll: () => void;
  maxVisible?: number;
  className?: string;
}

const ALERT_ICONS = {
  low_balance: DollarSign,
  upcoming_payment: Calendar,
  debt_reminder: AlertTriangle,
  budget_exceeded: TrendingDown,
  savings_opportunity: Bell,
  income_received: DollarSign,
  goal_achieved: Bell
};

const ALERT_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#2563eb',
  low: '#059669'
};

export const FinancialAlerts: React.FC<FinancialAlertsProps> = ({
  alerts,
  onMarkAsRead,
  onDismissAll,
  maxVisible = 5,
  className = ''
}) => {
  const visibleAlerts = alerts.slice(0, maxVisible);
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (alert: FinancialAlert) => {
    const IconComponent = ALERT_ICONS[alert.type] || Bell;
    return <IconComponent size={18} style={{ color: ALERT_COLORS[alert.severity] }} />;
  };

  const getAlertTypeLabel = (type: FinancialAlert['type']) => {
    switch (type) {
      case 'low_balance':
        return 'Saldo Bajo';
      case 'upcoming_payment':
        return 'Pago Próximo';
      case 'debt_reminder':
        return 'Recordatorio de Deuda';
      case 'budget_exceeded':
        return 'Presupuesto Excedido';
      case 'savings_opportunity':
        return 'Oportunidad de Ahorro';
      case 'income_received':
        return 'Ingreso Recibido';
      case 'goal_achieved':
        return 'Meta Alcanzada';
      default:
        return 'Alerta';
    }
  };

  const formatAlertTime = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `hace ${diffInDays}d`;
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Bell size={20} />
          Alertas Financieras
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </h3>
        {alerts.length > 0 && (
          <Button
            variant="outline"
            size="small"
            onClick={onDismissAll}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className={styles.alertsList}>
        {visibleAlerts.map((alert) => {
          const severityClass = `severity-${alert.severity}`;
          return (
            <div
              key={alert.id}
              className={`${styles.alertItem} ${styles[severityClass]} ${
                !alert.isRead ? styles.unread : ''
              }`}
            >
            <div className={styles.alertIcon}>
              {getAlertIcon(alert)}
            </div>

            <div className={styles.alertContent}>
              <div className={styles.alertHeader}>
                <h4 className={styles.alertTitle}>
                  {alert.title}
                </h4>
                <span className={styles.alertType}>
                  {getAlertTypeLabel(alert.type)}
                </span>
              </div>

              <p className={styles.alertMessage}>
                {alert.message}
              </p>

              <div className={styles.alertFooter}>
                <span className={styles.alertTime}>
                  {formatAlertTime(alert.createdAt)}
                </span>
                {alert.actionable && (
                  <span className={styles.actionRequired}>
                    Acción requerida
                  </span>
                )}
              </div>

              {/* Datos adicionales específicos por tipo */}
              {alert.data && (
                <div className={styles.alertData}>
                  {alert.type === 'low_balance' && alert.data.balance !== undefined && (
                    <div className={styles.dataItem}>
                      <strong>Saldo actual:</strong> {formatCurrency(alert.data.balance)}
                    </div>
                  )}
                  {alert.type === 'upcoming_payment' && alert.data.amount && (
                    <div className={styles.dataItem}>
                      <strong>Monto:</strong> {formatCurrency(alert.data.amount)}
                    </div>
                  )}
                  {alert.type === 'budget_exceeded' && alert.data.overspent && (
                    <div className={styles.dataItem}>
                      <strong>Exceso:</strong> {formatCurrency(alert.data.overspent)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.alertActions}>
              <Button
                variant="outline"
                size="small"
                onClick={() => onMarkAsRead(alert.id)}
                icon={X}
                className={styles.dismissButton}
              >
                <span className="sr-only">Marcar como leída</span>
              </Button>
            </div>
          </div>
        );
        })}
      </div>

      {alerts.length > maxVisible && (
        <div className={styles.moreAlerts}>
          <span className={styles.moreText}>
            +{alerts.length - maxVisible} alertas más
          </span>
        </div>
      )}
    </div>
  );
};

export default FinancialAlerts;
