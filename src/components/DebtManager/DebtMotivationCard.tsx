import React from 'react';
import styles from './DebtMotivationCard.module.css';
import { Trophy, TrendingUp, Calendar, DollarSign, Zap } from 'lucide-react';

interface DebtMotivationCardProps {
  totalDebt: number;
  totalPaid: number;
  estimatedMonthsRemaining: number;
  interestSaved: number;
  strategyName?: string;
  nextMilestone?: {
    debtName: string;
    amount: number;
    estimatedCompletion: string;
  };
}

const DebtMotivationCard: React.FC<DebtMotivationCardProps> = ({
  totalDebt,
  totalPaid,
  estimatedMonthsRemaining,
  interestSaved,
  strategyName,
  nextMilestone
}) => {
  const progressPercentage = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
  const remainingDebt = totalDebt - totalPaid;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const getMotivationalMessage = () => {
    if (progressPercentage === 0) {
      return "¡Es hora de empezar tu camino hacia la libertad financiera!";
    } else if (progressPercentage < 25) {
      return "¡Cada pago te acerca más a tu meta!";
    } else if (progressPercentage < 50) {
      return "¡Vas por buen camino! Ya tienes un cuarto del camino recorrido.";
    } else if (progressPercentage < 75) {
      return "¡Excelente progreso! Ya estás más cerca de la libertad financiera.";
    } else if (progressPercentage < 100) {
      return "¡Casi lo logras! Estás en la recta final.";
    } else {
      return "¡Felicitaciones! Has alcanzado la libertad financiera.";
    }
  };

  const getProgressColor = () => {
    if (progressPercentage < 25) return 'var(--danger-color)';
    if (progressPercentage < 50) return 'var(--warning-color)';
    if (progressPercentage < 75) return 'var(--info-color)';
    return 'var(--success-color)';
  };

  return (
    <div className={styles.motivationCard}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.iconWrapper}>
            <Trophy size={24} />
          </div>
          <div>
            <h3 className={styles.title}>Tu Progreso Hacia la Libertad Financiera</h3>
            {strategyName && (
              <p className={styles.strategy}>Estrategia: {strategyName}</p>
            )}
          </div>
        </div>
        <div className={styles.progressNumber}>
          {progressPercentage.toFixed(1)}%
        </div>
      </div>

      <div className={styles.motivationMessage}>
        <Zap size={20} />
        <span>{getMotivationalMessage()}</span>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ 
              width: `${Math.min(100, progressPercentage)}%`,
              backgroundColor: getProgressColor()
            }}
          />
        </div>
        <div className={styles.progressLabels}>
          <span>{formatCurrency(totalPaid)} pagado</span>
          <span>{formatCurrency(remainingDebt)} restante</span>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <div className={styles.metricIcon}>
            <Calendar size={20} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>
              {estimatedMonthsRemaining === 999 ? 'N/A' : `${estimatedMonthsRemaining} meses`}
            </span>
            <span className={styles.metricLabel}>Tiempo estimado</span>
          </div>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricIcon}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{formatCurrency(interestSaved)}</span>
            <span className={styles.metricLabel}>Interés ahorrado</span>
          </div>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricIcon}>
            <DollarSign size={20} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{formatCurrency(totalDebt)}</span>
            <span className={styles.metricLabel}>Deuda total</span>
          </div>
        </div>
      </div>

      {nextMilestone && (
        <div className={styles.nextMilestone}>
          <div className={styles.milestoneHeader}>
            <h4>Próxima Meta:</h4>
          </div>
          <div className={styles.milestoneContent}>
            <div className={styles.milestoneInfo}>
              <span className={styles.milestoneName}>{nextMilestone.debtName}</span>
              <span className={styles.milestoneAmount}>{formatCurrency(nextMilestone.amount)}</span>
            </div>
            <div className={styles.milestoneDate}>
              Estimado: {nextMilestone.estimatedCompletion}
            </div>
          </div>
        </div>
      )}

      <div className={styles.encouragement}>
        <p>
          {progressPercentage > 0 
            ? "¡Mantén el impulso! Cada pago te acerca más a tus objetivos financieros."
            : "¡Comienza hoy! El primer paso es el más importante hacia tu libertad financiera."
          }
        </p>
      </div>
    </div>
  );
};

export default DebtMotivationCard;
