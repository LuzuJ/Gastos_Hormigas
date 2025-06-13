import React from 'react';
import styles from './Summary.module.css';

interface SummaryProps {
  total: number;
}

export const Summary: React.FC<SummaryProps> = ({ total }) => (
    <div className={styles.box}>
        <div className={styles.content}>
            <span className={styles.label}>Total de Hoy:</span>
            <span className={styles.total}>${total.toFixed(2)}</span>
        </div>
    </div>
);
