import React from 'react';
import styles from './Summary.module.css';

interface SummaryProps {
    totalToday: number;
    totalMonth: number;
    monthlyIncome: number;
    fixedExpensesTotal: number;
}

const formatCurrency = (value: number) => {
  const isNegative = value < 0;
  const absoluteValue = Math.abs(value).toFixed(2);

  return isNegative ? `- $${absoluteValue}` : `$${absoluteValue}`;
};

export const Summary: React.FC<SummaryProps> = ({ totalToday, totalMonth, monthlyIncome, fixedExpensesTotal }) => {
    // Calcular balance considerando solo gastos variables del mes + gastos fijos
    const variableExpenses = totalMonth; // Solo gastos variables del mes actual
    const totalExpenses = variableExpenses + fixedExpensesTotal; // Total real de gastos
    const balance = monthlyIncome - totalExpenses;
    const spendingPercentage = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

    // Determinar la clase CSS para la barra de progreso
    const getProgressClass = () => {
        if (spendingPercentage >= 100) return styles.overBudget;
        if (spendingPercentage >= 80) return styles.warning;
        return styles.normal;
    };

    return (
        <div className={styles.container}>
            {/* Métricas principales en grid */}
            <div className={styles.mainMetrics}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>💰</div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricLabel}>Ingreso Mensual</span>
                        <span className={`${styles.metricValue} ${styles.income}`}>
                            {formatCurrency(monthlyIncome)}
                        </span>
                    </div>
                </div>
                
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>📊</div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricLabel}>Gastado Hoy</span>
                        <span className={`${styles.metricValue} ${styles.expense}`}>
                            {formatCurrency(totalToday)}
                        </span>
                    </div>
                </div>
                
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>💸</div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricLabel}>Total Gastos</span>
                        <span className={`${styles.metricValue} ${styles.expense}`}>
                            {formatCurrency(totalExpenses)}
                        </span>
                    </div>
                </div>
                
                <div className={`${styles.metricCard} ${balance >= 0 ? styles.balancePositive : styles.balanceNegative}`}>
                    <div className={styles.metricIcon}>
                        {balance >= 0 ? '✅' : '⚠️'}
                    </div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricLabel}>
                            {balance >= 0 ? 'Saldo Disponible' : 'Sobregiro'}
                        </span>
                        <span className={`${styles.metricValue} ${balance >= 0 ? styles.balancePos : styles.balanceNeg}`}>
                            {formatCurrency(Math.abs(balance))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Barra de progreso del presupuesto */}
            <div className={styles.budgetProgress}>
                <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Uso del Presupuesto Mensual</span>
                    <span className={styles.progressPercentage}>
                        {spendingPercentage.toFixed(1)}%
                    </span>
                </div>
                
                {/* Mensaje de estado del presupuesto */}
                {spendingPercentage > 100 && (
                    <div className={styles.budgetAlert}>
                        ⚠️ <strong>Sobregiro:</strong> Has excedido tu presupuesto en {formatCurrency(totalExpenses - monthlyIncome)}
                    </div>
                )}
                
                <div className={styles.progressBar}>
                    <div 
                        className={`${styles.progressFill} ${getProgressClass()}`}
                        style={{ width: `${Math.min(spendingPercentage, 150)}%` }}
                    />
                    {/* Mostrar la parte excedente si supera el 100% */}
                    {spendingPercentage > 100 && (
                        <div 
                            className={styles.progressOverflow}
                            style={{ 
                                width: `${Math.min(spendingPercentage - 100, 50)}%`,
                                left: '100%'
                            }}
                        />
                    )}
                </div>
                <div className={styles.progressLabels}>
                    <span>$0</span>
                    <span>{formatCurrency(monthlyIncome)}</span>
                    {spendingPercentage > 100 && (
                        <span className={styles.overflowLabel}>
                            {formatCurrency(totalExpenses)}
                        </span>
                    )}
                </div>
            </div>

            {/* Desglose detallado */}
            <div className={styles.breakdown}>
                <h4 className={styles.breakdownTitle}>Desglose de Gastos</h4>
                
                <div className={styles.breakdownGrid}>
                    <div className={styles.breakdownItem}>
                        <div className={styles.breakdownIcon}>🔄</div>
                        <div className={styles.breakdownInfo}>
                            <span className={styles.breakdownLabel}>Variables</span>
                            <span className={styles.breakdownValue}>
                                {formatCurrency(variableExpenses)}
                            </span>
                        </div>
                    </div>
                    
                    <div className={styles.breakdownItem}>
                        <div className={styles.breakdownIcon}>📅</div>
                        <div className={styles.breakdownInfo}>
                            <span className={styles.breakdownLabel}>Fijos</span>
                            <span className={styles.breakdownValue}>
                                {formatCurrency(fixedExpensesTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
