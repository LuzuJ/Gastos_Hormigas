import React from 'react';
import styles from './BudgetProgressBar.module.css';

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ spent, budget }) => {
  if (budget <= 0) return null; 

  const percentage = Math.min((spent / budget) * 100, 100);
  
  let barColorClass = styles.green;
  if (percentage > 90) barColorClass = styles.yellow;
  if (percentage >= 100) barColorClass = styles.red;

  return (
    <div className={styles.container}>
      <div className={styles.labels}>
        <span>${spent.toFixed(2)}</span>
        <span>${budget.toFixed(2)}</span>
      </div>
      <div className={styles.track}>
        <div 
          className={`${styles.bar} ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
