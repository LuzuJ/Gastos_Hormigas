import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertTriangle, 
  Bell, 
  Eye, 
  EyeOff,
  RefreshCw,
  Calendar,
  Target
} from 'lucide-react';
import { Button } from '../common';
import { LoadingStateWrapper } from '../LoadingState/LoadingState';
import { formatCurrency } from '../../utils/formatters';
import { useFinancialAutomation } from '../../hooks/useFinancialAutomation';
import styles from './FinancialDashboard.module.css';
import type { FinancialAlert } from '../../types';

interface FinancialDashboardProps {
  userId: string | null;
  className?: string;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  userId, 
  className = '' 
}) => {
  const {
    financialAlerts,
    paymentSourceBalances,
    isProcessingAutomatic,
    loading,
    error,
    processAllRecurringIncomes,
    markAlertAsRead,
    refreshAllPaymentSourceBalances,
    runAutomaticProcessing,
    getFinancialSummary,
    clearError
  } = useFinancialAutomation(userId);

  const [showBalances, setShowBalances] = useState(true);

  const summary = getFinancialSummary();

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        refreshAllPaymentSourceBalances();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [userId, refreshAllPaymentSourceBalances]);

  const handleRunAutomaticProcessing = async () => {
    await runAutomaticProcessing();
  };

  const getAlertIcon = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className={styles.alertIconCritical} size={16} />;
      case 'high':
        return <AlertTriangle className={styles.alertIconHigh} size={16} />;
      case 'medium':
        return <Bell className={styles.alertIconMedium} size={16} />;
      default:
        return <Bell className={styles.alertIconLow} size={16} />;
    }
  };

  const getBalanceChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className={styles.trendingUp} size={20} />;
    } else if (change < 0) {
      return <TrendingDown className={styles.trendingDown} size={20} />;
    }
    return <DollarSign size={20} />;
  };

  if (!userId) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.guestMessage}>
          <h3>Panel Financiero</h3>
          <p>Inicia sesión para acceder a tu panel de control financiero</p>
        </div>
      </div>
    );
  }

  return (
    <LoadingStateWrapper
      loading={loading}
      error={error}
      onDismissError={clearError}
      loadingMessage="Cargando panel financiero..."
    >
      <div className={`${styles.container} ${className}`}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Panel Financiero</h2>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowBalances(!showBalances)}
              icon={showBalances ? EyeOff : Eye}
            >
              {showBalances ? 'Ocultar' : 'Mostrar'} Saldos
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={refreshAllPaymentSourceBalances}
              icon={RefreshCw}
            >
              Actualizar
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={handleRunAutomaticProcessing}
              disabled={isProcessingAutomatic}
              icon={RefreshCw}
            >
              {isProcessingAutomatic ? 'Procesando...' : 'Procesar Automático'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h3>Balance Total</h3>
              {getBalanceChangeIcon(summary.balanceChange)}
            </div>
            <div className={styles.cardValue}>
              {showBalances ? formatCurrency(summary.totalBalance) : '••••••'}
            </div>
            <div className={styles.cardSubtext}>
              Proyección: {showBalances ? formatCurrency(summary.projectedBalance) : '••••••'}
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h3>Alertas Activas</h3>
              <Bell size={20} />
            </div>
            <div className={styles.cardValue}>
              {summary.unreadAlerts}
            </div>
            <div className={styles.cardSubtext}>
              {summary.criticalAlerts} críticas, {summary.highAlerts} importantes
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h3>Cambio Proyectado</h3>
              {getBalanceChangeIcon(summary.balanceChange)}
            </div>
            <div className={`${styles.cardValue} ${
              summary.balanceChange >= 0 ? styles.positive : styles.negative
            }`}>
              {showBalances ? formatCurrency(Math.abs(summary.balanceChange)) : '••••••'}
            </div>
            <div className={styles.cardSubtext}>
              Próximos 30 días
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {financialAlerts.length > 0 && (
          <div className={styles.alertsSection}>
            <h3 className={styles.sectionTitle}>
              <AlertTriangle size={20} />
              Alertas Financieras
            </h3>
            <div className={styles.alertsList}>
              {financialAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={styles.alertItem + ' ' + styles['severity-' + alert.severity]}
                  onClick={() => markAlertAsRead(alert.id)}
                >
                  <div className={styles.alertIcon}>
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className={styles.alertContent}>
                    <h4 className={styles.alertTitle}>{alert.title}</h4>
                    <p className={styles.alertMessage}>{alert.message}</p>
                    <span className={styles.alertTime}>
                      {alert.createdAt.toDate().toLocaleString()}
                    </span>
                  </div>
                  {alert.actionable && (
                    <div className={styles.alertAction}>
                      <Button variant="outline" size="small">
                        Acción Requerida
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Sources Balance */}
        <div className={styles.balancesSection}>
          <h3 className={styles.sectionTitle}>
            <DollarSign size={20} />
            Saldos por Fuente
          </h3>
          <div className={styles.balancesList}>
            {paymentSourceBalances.map((balance) => (
              <div key={balance.paymentSourceId} className={styles.balanceItem}>
                <div className={styles.balanceHeader}>
                  <h4 className={styles.balanceName}>{balance.name}</h4>
                  <span className={styles.balanceType}>{balance.type}</span>
                </div>
                <div className={styles.balanceValues}>
                  <div className={styles.currentBalance}>
                    <span className={styles.balanceLabel}>Actual:</span>
                    <span className={styles.balanceAmount}>
                      {showBalances ? formatCurrency(balance.currentBalance) : '••••••'}
                    </span>
                  </div>
                  <div className={styles.projectedBalance}>
                    <span className={styles.balanceLabel}>Proyectado:</span>
                    <span className={`${styles.balanceAmount} ${
                      balance.projectedBalance >= balance.currentBalance 
                        ? styles.positive 
                        : styles.negative
                    }`}>
                      {showBalances ? formatCurrency(balance.projectedBalance) : '••••••'}
                    </span>
                  </div>
                </div>
                <div className={styles.pendingTransactions}>
                  <span className={styles.pending}>
                    Pendiente: +{formatCurrency(balance.pendingTransactions.income)} / 
                    -{formatCurrency(balance.pendingTransactions.expenses)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.actionsSection}>
          <h3 className={styles.sectionTitle}>
            <Target size={20} />
            Acciones Rápidas
          </h3>
          <div className={styles.quickActions}>
            <Button
              variant="outline"
              onClick={processAllRecurringIncomes}
              disabled={isProcessingAutomatic}
              icon={Calendar}
            >
              Procesar Ingresos
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Configurar alertas')}
              icon={Bell}
            >
              Configurar Alertas
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Ver proyecciones')}
              icon={TrendingUp}
            >
              Ver Proyecciones
            </Button>
          </div>
        </div>
      </div>
    </LoadingStateWrapper>
  );
};

export default FinancialDashboard;
