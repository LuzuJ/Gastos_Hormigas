import React from 'react';
import styles from './Summary.module.css';

interface SummaryProps {
    totalToday: number;
    totalMonth: number;
    monthlyIncome: number;
}

export const Summary: React.FC<SummaryProps> = ({ totalToday, totalMonth, monthlyIncome }) => {
    const balance = monthlyIncome - totalMonth;

    return (
        <div className={styles.container}>
            {/* Resumen Mensual */}
            <div className={styles.box}>
                <span className={styles.label}>Ingreso Mensual</span>
                <span className={`${styles.value} ${styles.income}`}>${monthlyIncome.toFixed(2)}</span>
            </div>
            <div className={styles.box}>
                <span className={styles.label}>Gastos del Mes</span>
                <span className={`${styles.value} ${styles.expense}`}>${totalMonth.toFixed(2)}</span>
            </div>
            <div className={styles.box}>
                <span className={styles.label}>Saldo Restante</span>
                <span className={`${styles.value} ${balance >= 0 ? styles.balancePositive : styles.balanceNegative}`}>
                    ${balance.toFixed(2)}
                </span>
            </div>
            {/* Resumen Diario */}
            <div className={`${styles.box} ${styles.todayBox}`}>
                <span className={styles.label}>Total Gastado Hoy</span>
                <span className={`${styles.value} ${styles.expense}`}>${totalToday.toFixed(2)}</span>
            </div>
        </div>
    );
};
