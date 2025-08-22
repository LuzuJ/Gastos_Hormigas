import React, { createContext, useContext, type ReactNode } from 'react';
import { useNetWorth } from '../hooks/financials/useNetWorth';
import { useSavingsGoals } from '../hooks/savings/useSavingsGoals';

// Contexto para patrimonio neto y metas de ahorro (relacionados con la planificación financiera)
const NetWorthContext = createContext<ReturnType<typeof useNetWorth> | null>(null);
const SavingsGoalsContext = createContext<ReturnType<typeof useSavingsGoals> | null>(null);

interface PlanningProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const PlanningProvider: React.FC<PlanningProviderProps> = ({ children, userId }) => {
  const netWorthData = useNetWorth(userId);
  const savingsGoalsData = useSavingsGoals(userId);

  return (
    <NetWorthContext.Provider value={netWorthData}>
      <SavingsGoalsContext.Provider value={savingsGoalsData}>
        {children}
      </SavingsGoalsContext.Provider>
    </NetWorthContext.Provider>
  );
};

export const useNetWorthContext = () => {
  const context = useContext(NetWorthContext);
  if (!context) {
    throw new Error('useNetWorthContext debe ser usado dentro de PlanningProvider');
  }
  return context;
};

export const useSavingsGoalsContext = () => {
  const context = useContext(SavingsGoalsContext);
  if (!context) {
    throw new Error('useSavingsGoalsContext debe ser usado dentro de PlanningProvider');
  }
  return context;
};
