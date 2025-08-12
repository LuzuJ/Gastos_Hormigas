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
    const balance = monthlyIncome - totalMonth;
    const variableExpenses = totalMonth - fixedExpensesTotal;

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <span className={styles.label}>Ingreso Mensual</span>
                <span className={`${styles.value} ${styles.income}`}>{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className={`${styles.box} ${styles.expenseBox}`}>
                <span className={styles.label}>Total Gastos del Mes</span>
                <span className={`${styles.value} ${styles.expense}`}>{formatCurrency(totalMonth)}</span>
                <div className={styles.breakdown}>
                    <span>Fijos: {formatCurrency(fixedExpensesTotal)}</span>
                    <span>Variables: {formatCurrency(variableExpenses)}</span>
                </div>
            </div>
            <div className={styles.box}>
                <span className={styles.label}>Saldo Restante</span>
                <span className={`${styles.value} ${balance >= 0 ? styles.balancePositive : styles.balanceNegative}`}>
                    {formatCurrency(balance)}
                </span>
            </div>
            <div className={`${styles.box} ${styles.todayBox}`}>
                <span className={styles.label}>Gastado Hoy</span>
                <span className={`${styles.value} ${styles.expense}`}>{formatCurrency(totalToday)}</span>
            </div>
        </div>
    );
};
