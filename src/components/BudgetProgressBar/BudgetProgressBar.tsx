import React from 'react';
import { ProgressBar } from '../common/ProgressBar/ProgressBar';

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ spent, budget }) => {
  if (budget <= 0) return null; 

  const percentage = (spent / budget) * 100;
  
  // Determinar variante basada en el porcentaje
  let variant: 'success' | 'warning' | 'danger' = 'success';
  if (percentage > 90) variant = 'warning';
  if (percentage >= 100) variant = 'danger';

  return (
    <ProgressBar
      value={spent}
      max={budget}
      variant={variant}
      size="medium"
      showLabel={false}
      showValue={false}
      valueFormat="currency"
      animated={true}
      rounded={true}
      className="budget-progress-bar"
    />
  );
};
