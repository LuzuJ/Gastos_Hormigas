import React from 'react';
import type { DebtPaymentPlan } from '../../../../types';
import styles from './DebtMotivationCard.module.css';
import { formatCurrency } from '../../../../utils/formatters';

interface DebtMotivationCardProps {
  paymentPlan: DebtPaymentPlan;
  progress: number;
  motivationalMessage: string;
  totalDebtAmount: number;
}

export const DebtMotivationCard: React.FC<DebtMotivationCardProps> = ({
  paymentPlan,
  progress,
  motivationalMessage,
  totalDebtAmount
}) => {
  const formatMonths = (months: number) => {
    if (months === Infinity || isNaN(months)) return 'No aplicable';
    if (months <= 12) return `${months} meses`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }
    
    return `${years}a ${remainingMonths}m`;
  };

  const progressPercentage = Math.round(progress * 100);
  const remainingDebt = totalDebtAmount * (1 - progress);

  return (
    <div className={styles.motivationCard}>
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          {paymentPlan.strategy.type === 'snowball' ? '❄️' : '🏔️'}
        </div>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{paymentPlan.strategy.name}</h3>
          <p className={styles.subtitle}>{motivationalMessage}</p>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progreso Total</span>
          <span className={styles.progressPercentage}>{progressPercentage}%</span>
        </div>
        
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBar}
            style={{ '--progress-width': `${progressPercentage}%` } as React.CSSProperties}
          />
        </div>
        
        <div className={styles.progressStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Restante</span>
            <span className={styles.statValue}>{formatCurrency(remainingDebt)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Tiempo estimado</span>
            <span className={styles.statValue}>{formatMonths(paymentPlan.totalMonthsToPayOff)}</span>
          </div>
        </div>
      </div>

      {paymentPlan.nextDebtToFocus && (
        <div className={styles.nextTarget}>
          <h4 className={styles.nextTargetTitle}>🎯 Próximo objetivo</h4>
          <div className={styles.nextTargetInfo}>
            <span className={styles.nextTargetName}>
              {paymentPlan.nextDebtToFocus.name}
            </span>
            <span className={styles.nextTargetAmount}>
              {formatCurrency(paymentPlan.nextDebtToFocus.amount)}
            </span>
          </div>
        </div>
      )}

      {paymentPlan.totalInterestSaved > 0 && (
        <div className={styles.savings}>
          <div className={styles.savingsIcon}>💰</div>
          <div className={styles.savingsText}>
            <span>Ahorrarás </span>
            <strong>{formatCurrency(paymentPlan.totalInterestSaved)}</strong>
            <span> en intereses</span>
          </div>
        </div>
      )}
    </div>
  );
};
