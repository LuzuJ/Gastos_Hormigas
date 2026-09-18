import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import styles from './HeroBalance.module.css';

interface HeroBalanceProps {
    balance: number;
    monthlyIncome: number;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({ balance, monthlyIncome }) => {
    // Simple health logic for now
    const getHealthStatus = () => {
        if (balance < 0) return { status: 'danger', label: 'Sobregiro' };
        if (balance < monthlyIncome * 0.1) return { status: 'warning', label: 'Bajo' };
        return { status: 'healthy', label: 'Saludable' };
    };

    const { status, label } = getHealthStatus();

    // Split currency and amount for styling
    const formatted = formatCurrency(Math.abs(balance));
    const currencySymbol = formatted.charAt(0);
    const amountValue = formatted.slice(1);

    return (
        <div className={styles.heroContainer}>
            <span className={styles.label}>Saldo Disponible</span>
            <div className={styles.balanceWrapper}>
                <span className={styles.currency}>{currencySymbol}</span>
                <span className={styles.amount}>{amountValue}</span>
            </div>

            <div className={`${styles.healthPill} ${styles[status]}`}>
                {status === 'healthy' ? '✨' : status === 'warning' ? '⚠️' : '🚨'}
                {label}
            </div>
        </div>
    );
};
