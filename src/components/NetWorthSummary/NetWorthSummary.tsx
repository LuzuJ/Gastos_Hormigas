import React from 'react';
import styles from './NetWorthSummary.module.css';
import { Landmark, TrendingUp, TrendingDown } from 'lucide-react';

interface NetWorthSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export const NetWorthSummary: React.FC<NetWorthSummaryProps> = ({ totalAssets, totalLiabilities, netWorth }) => {
  return (
    <div className={styles.container}>
        <div className={styles.card}>
            <TrendingUp className={`${styles.icon} ${styles.assetsIcon}`} />
            <div>
                <span className={styles.label}>Activos Totales</span>
                <span className={styles.value}>{formatCurrency(totalAssets)}</span>
            </div>
        </div>
        <div className={styles.card}>
            <TrendingDown className={`${styles.icon} ${styles.liabilitiesIcon}`} />
            <div>
                <span className={styles.label}>Pasivos Totales</span>
                <span className={styles.value}>{formatCurrency(totalLiabilities)}</span>
            </div>
        </div>
        <div className={`${styles.card} ${styles.netWorthCard}`}>
            <Landmark className={styles.icon} />
            <div>
                <span className={styles.label}>Patrimonio Neto</span>
                <span className={styles.value}>{formatCurrency(netWorth)}</span>
            </div>
        </div>
    </div>
  );
};