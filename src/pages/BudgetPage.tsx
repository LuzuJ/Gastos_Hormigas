import React from 'react';
import { BudgetManager } from '../components/BudgetManager';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { 
  useCategoriesContext, 
  useExpensesContext, 
  useCombinedCalculationsContext 
} from '../contexts/AppContext';
import styles from './BudgetPage.module.css';

export const BudgetPage: React.FC = () => {
  const { categories, loadingCategories, updateCategoryBudget } = useCategoriesContext();
  const { expenses } = useExpensesContext();
  const { monthlyExpensesByCategory } = useCombinedCalculationsContext();

  const handleCategoryBudgetUpdate = async (categoryId: string, budget: number) => {
    await updateCategoryBudget(categoryId, budget);
  };

  return (
    <div className={styles.container}>
      <LoadingStateWrapper 
        loading={loadingCategories}
        error={null}
      >
        <BudgetManager
          categories={categories}
          expenses={expenses}
          monthlyExpensesByCategory={monthlyExpensesByCategory}
          onCategoryBudgetUpdate={handleCategoryBudgetUpdate}
        />
      </LoadingStateWrapper>
    </div>
  );
};

// Exportación por defecto para compatibilidad con lazy loading
export default BudgetPage;
