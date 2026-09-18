import React, { ReactNode } from 'react';
import { Card } from '../Card/Card';
import styles from './StatsCard.module.css';

interface StatsCardProps {
    label: string;
    value: string;
    icon?: ReactNode;
    trend?: {
        value: number; // e.g. 5.2
        isPositive: boolean; // true = good (e.g. savings up)
    };
    status?: 'success' | 'warning' | 'danger';
    onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    label,
    value,
    icon,
    trend,
    status,
    onClick
}) => {
    return (
        <Card onClick={onClick} className={styles.card} padding="md">
            <div className={styles.label}>
                {icon}
                {label}
            </div>
            <div className={styles.valueRow}>
                <span className={styles.value}>{value}</span>
                {status && (
                    <span className={`${styles.indicator} ${styles[status]}`}>
                        {status === 'success' ? 'Good' : status === 'danger' ? 'Alert' : 'Fair'}
                    </span>
                )}
            </div>
        </Card>
    );
};
