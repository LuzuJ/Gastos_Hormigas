import React from 'react';
import styles from './BarChart.module.css';
import { formatCurrency } from '../../../utils/formatters';

interface BarChartData {
    label: string;
    value: number;
    color?: string;
}

interface BarChartProps {
    data: BarChartData[];
    showValues?: boolean;
    maxBars?: number;
    horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
    data,
    showValues = true,
    maxBars = 6,
    horizontal = true,
}) => {
    const sortedData = [...data]
        .sort((a, b) => b.value - a.value)
        .slice(0, maxBars);

    const maxValue = Math.max(...sortedData.map(d => d.value), 1);

    if (sortedData.length === 0 || sortedData.every(d => d.value === 0)) {
        return (
            <div className={styles.emptyState}>
                Sin datos para mostrar
            </div>
        );
    }

    const defaultColors = [
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
    ];

    return (
        <div className={`${styles.container} ${horizontal ? styles.horizontal : styles.vertical}`}>
            {sortedData.map((item, index) => {
                const percentage = (item.value / maxValue) * 100;
                const color = item.color || defaultColors[index % defaultColors.length];

                return (
                    <div key={index} className={styles.barItem}>
                        <div className={styles.labelRow}>
                            <span className={styles.label}>{item.label}</span>
                            {showValues && (
                                <span className={styles.value}>{formatCurrency(item.value)}</span>
                            )}
                        </div>
                        <div className={styles.barTrack}>
                            <div
                                className={styles.barFill}
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: color,
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
