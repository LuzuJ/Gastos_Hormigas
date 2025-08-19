import { useState, useMemo, useCallback } from 'react';
import type { 
  Liability, 
  DebtPaymentStrategy, 
  DebtPaymentPlan,
  DebtPaymentStrategyType 
} from '../types';
import {
  createPaymentStrategy,
  calculateDebtPaymentPlan,
  getMotivationalMessage
} from '../services/debtPaymentService';

export interface UseDebtPaymentStrategiesResult {
  // Estados
  currentStrategy: DebtPaymentStrategy;
  monthlyExtraBudget: number;
  paymentPlan: DebtPaymentPlan | null;
  
  // Acciones
  setStrategyType: (type: DebtPaymentStrategyType) => void;
  setMonthlyExtraBudget: (amount: number) => void;
  
  // Utilidades
  getProgress: () => number;
  getMotivationalMessage: () => string;
  getNextDebtFocus: () => Liability | null;
  getTotalDebtAmount: () => number;
  getTotalMonthlyMinimums: () => number;
  
  // Comparaciones
  compareStrategies: () => {
    snowball: DebtPaymentPlan;
    avalanche: DebtPaymentPlan;
  };
}

export const useDebtPaymentStrategies = (
  liabilities: Liability[]
): UseDebtPaymentStrategiesResult => {
  // Estados locales
  const [strategyType, setStrategyType] = useState<DebtPaymentStrategyType>('snowball');
  const [monthlyExtraBudget, setMonthlyExtraBudget] = useState<number>(0);
  
  // Calcular estrategia actual
  const currentStrategy = useMemo(() => 
    createPaymentStrategy(strategyType, monthlyExtraBudget),
    [strategyType, monthlyExtraBudget]
  );
  
  // Calcular plan de pago actual
  const paymentPlan = useMemo(() => 
    calculateDebtPaymentPlan(liabilities, currentStrategy),
    [liabilities, currentStrategy]
  );
  
  // Función para calcular el progreso total
  const getProgress = useCallback((): number => {
    if (!paymentPlan || paymentPlan.debts.length === 0) return 0;
    
    const totalOriginalDebt = paymentPlan.debts.reduce(
      (sum, debt) => sum + (debt.liability.originalAmount || debt.liability.amount), 
      0
    );
    
    const currentTotalDebt = paymentPlan.debts.reduce(
      (sum, debt) => sum + debt.liability.amount, 
      0
    );
    
    if (totalOriginalDebt === 0) return 0;
    
    return Math.max(0, Math.min(1, (totalOriginalDebt - currentTotalDebt) / totalOriginalDebt));
  }, [paymentPlan]);
  
  // Función para obtener mensaje motivacional
  const getMotivationalMessageCallback = useCallback((): string => {
    const progress = getProgress();
    return getMotivationalMessage(currentStrategy, progress);
  }, [currentStrategy, getProgress]);
  
  // Función para obtener la próxima deuda a enfocarse
  const getNextDebtFocus = useCallback((): Liability | null => {
    return paymentPlan?.nextDebtToFocus || null;
  }, [paymentPlan]);
  
  // Función para calcular el total de deuda
  const getTotalDebtAmount = useCallback((): number => {
    return liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  }, [liabilities]);
  
  // Función para calcular el total de pagos mínimos mensuales
  const getTotalMonthlyMinimums = useCallback((): number => {
    if (!paymentPlan) return 0;
    
    return paymentPlan.monthlyBudgetDistribution
      .filter(dist => dist.type === 'minimum')
      .reduce((sum, dist) => sum + dist.amount, 0);
  }, [paymentPlan]);
  
  // Función para comparar estrategias
  const compareStrategies = useCallback(() => {
    const snowballStrategy = createPaymentStrategy('snowball', monthlyExtraBudget);
    const avalancheStrategy = createPaymentStrategy('avalanche', monthlyExtraBudget);
    
    return {
      snowball: calculateDebtPaymentPlan(liabilities, snowballStrategy),
      avalanche: calculateDebtPaymentPlan(liabilities, avalancheStrategy)
    };
  }, [liabilities, monthlyExtraBudget]);
  
  return {
    // Estados
    currentStrategy,
    monthlyExtraBudget,
    paymentPlan,
    
    // Acciones
    setStrategyType,
    setMonthlyExtraBudget,
    
    // Utilidades
    getProgress,
    getMotivationalMessage: getMotivationalMessageCallback,
    getNextDebtFocus,
    getTotalDebtAmount,
    getTotalMonthlyMinimums,
    
    // Comparaciones
    compareStrategies
  };
};
