import React from 'react';
import styles from './BudgetSummary.module.css';
import type { Category } from '../../types';
import { PiggyBank } from 'lucide-react';

interface BudgetSummaryProps {
  categories: Category[];
  monthlyExpensesByCategory: { name: string; value: number }[];
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ categories, monthlyExpensesByCategory }) => {
  // Filtramos solo las categorías que tienen un presupuesto definido y mayor a cero
  const budgetedCategories = categories.filter(c => c.budget && c.budget > 0);

  if (budgetedCategories.length === 0) {
    return null; // No mostramos nada si no hay presupuestos configurados
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PiggyBank className={styles.icon} />
        <h3 className={styles.title}>Progreso de Presupuestos</h3>
      </div>
      <ul className={styles.list}>
        {budgetedCategories.map(category => {
          const spent = monthlyExpensesByCategory.find(e => e.name === category.name)?.value || 0;
          const progress = category.budget! > 0 ? (spent / category.budget!) * 100 : 0;
          
          let progressBarColorClass = styles.green;
          if (progress > 80) progressBarColorClass = styles.yellow;
          if (progress >= 100) progressBarColorClass = styles.red;

          return (
            <li key={category.id} className={styles.budgetItem}>
              <div className={styles.budgetInfo}>
                <span className={styles.budgetName}>{category.name}</span>
                <span className={styles.budgetAmount}>
                  ${spent.toFixed(2)} / ${category.budget!.toFixed(2)}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${progressBarColorClass}`} 
                  style={{ width: `${Math.min(progress, 100)}%` }} 
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};