import React from 'react';
import styles from './HealthIndicator.module.css';

export type HealthStatus = 'healthy' | 'warning' | 'danger';

interface HealthIndicatorProps {
    status: HealthStatus;
    label?: string;
    percentage?: number;
    showPercentage?: boolean;
    size?: 'small' | 'medium' | 'large';
    tooltip?: string;
}

/**
 * Componente de indicador de salud financiera
 * Muestra un semáforo visual: 🟢 Bien | 🟡 Precaución | 🔴 Peligro
 */
export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
    status,
    label,
    percentage,
    showPercentage = false,
    size = 'medium',
    tooltip
}) => {
    const getStatusEmoji = () => {
        switch (status) {
            case 'healthy': return '🟢';
            case 'warning': return '🟡';
            case 'danger': return '🔴';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'healthy': return 'Bien';
            case 'warning': return 'Precaución';
            case 'danger': return 'Alerta';
        }
    };

    return (
        <div
            className={`${styles.indicator} ${styles[status]} ${styles[size]}`}
            title={tooltip || `Estado: ${getStatusText()}`}
        >
            <span className={styles.emoji}>{getStatusEmoji()}</span>
            {label && <span className={styles.label}>{label}</span>}
            {showPercentage && percentage !== undefined && (
                <span className={styles.percentage}>{percentage.toFixed(0)}%</span>
            )}
        </div>
    );
};

/**
 * Calcula el estado de salud basado en un porcentaje de uso
 * @param usedPercentage - Porcentaje utilizado (0-100+)
 * @returns HealthStatus
 */
export const calculateHealthStatus = (usedPercentage: number): HealthStatus => {
    if (usedPercentage <= 70) return 'healthy';
    if (usedPercentage <= 90) return 'warning';
    return 'danger';
};

/**
 * Calcula el estado de salud para un balance
 * @param balance - Balance actual (puede ser negativo)
 * @param income - Ingreso mensual
 * @returns HealthStatus
 */
export const calculateBalanceHealth = (balance: number, income: number): HealthStatus => {
    if (income === 0) return balance >= 0 ? 'healthy' : 'danger';

    const balancePercentage = (balance / income) * 100;

    if (balancePercentage >= 20) return 'healthy'; // >20% disponible
    if (balancePercentage >= 5) return 'warning';   // 5-20% disponible
    return 'danger'; // <5% o negativo
};
