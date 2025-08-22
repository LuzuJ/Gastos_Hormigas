import React, { createContext, useContext, type ReactNode } from 'react';
import { useCombinedCalculations } from '../hooks/calculations/useCombinedCalculations';
import { useExpensesContext, useCategoriesContext } from './ExpensesContext';
import { useFinancialsContext } from './FinancialsContext';
import { useNotificationsContext } from './NotificationsContext';

// Contexto para cálculos combinados que requiere datos de múltiples contextos
const CombinedCalculationsContext = createContext<ReturnType<typeof useCombinedCalculations> | null>(null);

interface CombinedCalculationsProviderProps {
  children: ReactNode;
}

export const CombinedCalculationsProvider: React.FC<CombinedCalculationsProviderProps> = ({ children }) => {
  // Obtener datos de otros contextos
  const { expenses } = useExpensesContext();
  const { categories } = useCategoriesContext();
  const { totalFixedExpenses } = useFinancialsContext();
  const { addNotification } = useNotificationsContext();

  const combinedCalculationsData = useCombinedCalculations({
    expenses,
    categories,
    totalFixedExpenses,
    addNotification
  });

  return (
    <CombinedCalculationsContext.Provider value={combinedCalculationsData}>
      {children}
    </CombinedCalculationsContext.Provider>
  );
};

export const useCombinedCalculationsContext = () => {
  const context = useContext(CombinedCalculationsContext);
  if (!context) {
    throw new Error('useCombinedCalculationsContext debe ser usado dentro de CombinedCalculationsProvider');
  }
  return context;
};
