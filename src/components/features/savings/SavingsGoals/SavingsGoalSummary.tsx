import React from 'react';
import styles from './SavingsGoalSummary.module.css';
import { Target } from 'lucide-react';
import type { SavingsGoal } from '../../../../types';

interface SavingsGoalSummaryProps {
  savingsGoals: SavingsGoal[];
}

export const SavingsGoalSummary: React.FC<SavingsGoalSummaryProps> = ({ savingsGoals }) => {
  if (savingsGoals.length === 0) {
    return null; // No mostramos nada si no hay metas
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Target className={styles.icon} />
        <h3 className={styles.title}>Progreso de Metas</h3>
      </div>
      <ul className={styles.list}>
        {savingsGoals.map(goal => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          return (
            <li key={goal.id} className={styles.goalItem}>
              <div className={styles.goalInfo}>
                <span className={styles.goalName}>{goal.name}</span>
                <span className={styles.goalAmount}>
                  ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};