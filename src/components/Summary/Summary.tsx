import React from 'react';
import styles from './Summary.module.css';
import { formatCurrency } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar/ProgressBar';

interface SummaryProps {
    totalToday: number;
    totalMonth: number;
    monthlyIncome: number;
    fixedExpensesTotal: number;
}

export const Summary: React.FC<SummaryProps> = ({ totalToday, totalMonth, monthlyIncome, fixedExpensesTotal }) => {
    // Calcular balance considerando solo gastos variables del mes + gastos fijos
    const variableExpenses = totalMonth; // Solo gastos variables del mes actual
    const totalExpenses = variableExpenses + fixedExpensesTotal; // Total real de gastos
    const balance = monthlyIncome - totalExpenses;
    const spendingPercentage = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;
    let progressBarVariant: 'danger' | 'warning' | 'success';
    if (spendingPercentage >= 100) {
        progressBarVariant = 'danger';
    } else if (spendingPercentage >= 80) {
        progressBarVariant = 'warning';
    } else {
        progressBarVariant = 'success';
    }

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
                {/* Mensaje de estado del presupuesto */}
                <ProgressBar
                    value={totalExpenses}
                    max={monthlyIncome}
                    variant={progressBarVariant}
                    size="large"
                    showLabel={true}
                    label="Uso del Presupuesto Mensual"
                    showValue={true}
                    valueFormat="currency"
                    animated={true}
                    rounded={true}
                />
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
