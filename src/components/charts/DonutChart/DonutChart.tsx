import React from 'react';
import styles from './DonutChart.module.css';

interface DonutChartSegment {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutChartSegment[];
    size?: number;
    thickness?: number;
    centerLabel?: string;
    centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    size = 200,
    thickness = 40,
    centerLabel,
    centerValue,
}) => {
    const total = data.reduce((sum, segment) => sum + segment.value, 0);

    if (total === 0) {
        return (
            <div className={styles.container} style={{ width: size, height: size }}>
                <div className={styles.emptyState}>
                    Sin datos
                </div>
            </div>
        );
    }

    // Calculate conic gradient
    let currentAngle = 0;
    const gradientParts = data.map((segment) => {
        const percentage = (segment.value / total) * 100;
        const start = currentAngle;
        currentAngle += percentage;
        return `${segment.color} ${start}% ${currentAngle}%`;
    }).join(', ');

    const innerSize = size - thickness * 2;

    return (
        <div className={styles.container}>
            <div
                className={styles.donut}
                style={{
                    width: size,
                    height: size,
                    background: `conic-gradient(${gradientParts})`,
                }}
            >
                <div
                    className={styles.hole}
                    style={{
                        width: innerSize,
                        height: innerSize,
                    }}
                >
                    {centerValue && (
                        <span className={styles.centerValue}>{centerValue}</span>
                    )}
                    {centerLabel && (
                        <span className={styles.centerLabel}>{centerLabel}</span>
                    )}
                </div>
            </div>

            <div className={styles.legend}>
                {data.filter(d => d.value > 0).slice(0, 5).map((segment, index) => (
                    <div key={index} className={styles.legendItem}>
                        <span
                            className={styles.legendColor}
                            style={{ backgroundColor: segment.color }}
                        />
                        <span className={styles.legendLabel}>{segment.label}</span>
                        <span className={styles.legendValue}>
                            {((segment.value / total) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
