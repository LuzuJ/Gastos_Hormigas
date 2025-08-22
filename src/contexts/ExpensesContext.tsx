import React, { createContext, useContext, type ReactNode } from 'react';
import { useExpenses } from '../hooks/expenses/useExpenses';
import { useCategories } from '../hooks/categories/useCategories';

// Contextos para gastos y categorías (muy relacionados)
const ExpensesContext = createContext<ReturnType<typeof useExpenses> | null>(null);
const CategoriesContext = createContext<ReturnType<typeof useCategories> | null>(null);

interface ExpensesProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const ExpensesProvider: React.FC<ExpensesProviderProps> = ({ children, userId }) => {
  const expensesData = useExpenses(userId);
  const categoriesData = useCategories(userId);

  return (
    <CategoriesContext.Provider value={categoriesData}>
      <ExpensesContext.Provider value={expensesData}>
        {children}
      </ExpensesContext.Provider>
    </CategoriesContext.Provider>
  );
};

export const useExpensesContext = () => {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error('useExpensesContext debe ser usado dentro de ExpensesProvider');
  }
  return context;
};

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategoriesContext debe ser usado dentro de ExpensesProvider');
  }
  return context;
};
