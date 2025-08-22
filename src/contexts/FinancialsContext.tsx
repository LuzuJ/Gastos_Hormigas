import React, { createContext, useContext, type ReactNode } from 'react';
import { useFinancials } from '../hooks/financials/useFinancials';

// Contexto para datos financieros (ingresos, gastos fijos, presupuestos)
const FinancialsContext = createContext<ReturnType<typeof useFinancials> | null>(null);

interface FinancialsProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const FinancialsProvider: React.FC<FinancialsProviderProps> = ({ children, userId }) => {
  const financialsData = useFinancials(userId);

  return (
    <FinancialsContext.Provider value={financialsData}>
      {children}
    </FinancialsContext.Provider>
  );
};

export const useFinancialsContext = () => {
  const context = useContext(FinancialsContext);
  if (!context) {
    throw new Error('useFinancialsContext debe ser usado dentro de FinancialsProvider');
  }
  return context;
};
