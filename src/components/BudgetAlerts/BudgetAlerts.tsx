import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import styles from './BudgetAlerts.module.css';
import { BudgetAlert, BudgetIntelligenceService } from '../../services/budget/budgetIntelligenceService';
import { Category, Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BudgetAlertsProps {
  categories: Category[];
  expenses: Expense[];
  onDismiss?: (alertId: string) => void;
  maxAlerts?: number;
}

export const BudgetAlerts: React.FC<BudgetAlertsProps> = ({
  categories,
  expenses,
  onDismiss,
  maxAlerts = 5
}) => {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const generatedAlerts = BudgetIntelligenceService.generateAlerts(categories, expenses);
    // Filtrar alertas ya descartadas
    const activeAlerts = generatedAlerts.filter(alert => !dismissedAlerts.has(alert.id));
    setAlerts(activeAlerts.slice(0, maxAlerts));
  }, [categories, expenses, dismissedAlerts, maxAlerts]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    onDismiss?.(alertId);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'var(--error-color)';
    if (percentage >= 90) return 'var(--warning-color)';
    return 'var(--success-color)';
  };

  const getAlertIcon = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'exceeded':
        return <AlertCircle className={styles.alertIcon} />;
      case 'danger':
        return <AlertTriangle className={styles.alertIcon} />;
      case 'warning':
        return <TrendingUp className={styles.alertIcon} />;
      case 'suggestion':
        return <Lightbulb className={styles.alertIcon} />;
      default:
        return <AlertTriangle className={styles.alertIcon} />;
    }
  };

  const getAlertClassName = (alert: BudgetAlert) => {
    const baseClass = styles.alert;
    const typeClass = styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`];
    const severityClass = styles[`severity${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}`];
    return `${baseClass} ${typeClass} ${severityClass}`;
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <AlertTriangle size={20} />
          Alertas de Presupuesto
        </h3>
        <span className={styles.badge}>{alerts.length}</span>
      </div>
      
      <div className={styles.alertsList}>
        {alerts.map((alert) => (
          <div key={alert.id} className={getAlertClassName(alert)}>
            <div className={styles.alertContent}>
              <div className={styles.alertHeader}>
                {getAlertIcon(alert.type)}
                <div className={styles.alertInfo}>
                  <h4 className={styles.alertTitle}>{alert.title}</h4>
                  <span className={styles.alertCategory}>{alert.categoryName}</span>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className={styles.dismissButton}
                  aria-label="Descartar alerta"
                >
                  <X size={16} />
                </button>
              </div>
              
              <p className={styles.alertMessage}>{alert.message}</p>
              
              {/* Barra de progreso del presupuesto */}
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${Math.min(alert.percentage, 100)}%`,
                      backgroundColor: getProgressColor(alert.percentage)
                    }}
                  />
                </div>
                <div className={styles.progressLabels}>
                  <span>{formatCurrency(alert.currentSpent)}</span>
                  <span className={styles.budgetTotal}>
                    / {formatCurrency(alert.budgetAmount)}
                  </span>
                </div>
              </div>

              {/* Sugerencias si están disponibles */}
              {alert.suggestions && alert.suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  <h5 className={styles.suggestionsTitle}>💡 Sugerencias:</h5>
                  <ul className={styles.suggestionsList}>
                    {alert.suggestions.map((suggestion) => (
                      <li key={`${alert.id}-suggestion-${suggestion.slice(0, 20)}`} className={styles.suggestionItem}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
