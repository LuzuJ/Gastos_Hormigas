import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { RecurringIncome, FinancialAlert, PaymentSourceBalance, EnhancedExpense } from '../../types';

// SERVICIO DESHABILITADO - Movido a legacy-firebase
// TODO: Reimplementar con Supabase si se necesita

export const useFinancialAutomation = (_userId: string | null) => {
  const [recurringIncomes] = useState<RecurringIncome[]>([]);
  const [financialAlerts] = useState<FinancialAlert[]>([]);
  const [paymentSourceBalances] = useState<PaymentSourceBalance[]>([]);
  const [isProcessingAutomatic] = useState(false);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processExpenseWithBalance = useCallback(async (_expense: EnhancedExpense, _paymentSourceId: string) => {
    toast.error('Servicio deshabilitado temporalmente');
    return { success: false, error: 'No disponible' };
  }, []);

  const updatePaymentSourceBalance = useCallback(async (_paymentSourceId: string, _newBalance: number, _description?: string) => {
    toast.error('Servicio deshabilitado temporalmente');
  }, []);

  const createRecurringIncome = useCallback(async (_incomeData: Omit<RecurringIncome, 'id'>) => {
    toast.error('Servicio deshabilitado temporalmente');
    throw new Error('No disponible');
  }, []);

  const processAllRecurringIncomes = useCallback(async () => {
    toast.error('Servicio deshabilitado temporalmente');
  }, []);

  const markAlertAsRead = useCallback(async (_alertId: string) => {}, []);
  const createAlert = useCallback(async (_alertData: Omit<FinancialAlert, 'id' | 'isRead' | 'createdAt'>) => {}, []);
  const refreshPaymentSourceBalance = useCallback(async (_paymentSourceId: string, _days: number = 30) => {}, []);
  const refreshAllPaymentSourceBalances = useCallback(async () => {}, []);
  const runAutomaticProcessing = useCallback(async () => { toast.error('Servicio deshabilitado temporalmente'); }, []);

  const getFinancialSummary = useCallback(() => ({
    totalBalance: 0, projectedBalance: 0, balanceChange: 0, unreadAlerts: 0,
    criticalAlerts: 0, highAlerts: 0, hasLowBalanceWarning: false
  }), []);

  return {
    recurringIncomes, financialAlerts, paymentSourceBalances, isProcessingAutomatic, loading, error,
    processExpenseWithBalance, updatePaymentSourceBalance, refreshPaymentSourceBalance, refreshAllPaymentSourceBalances,
    createRecurringIncome, processAllRecurringIncomes, markAlertAsRead, createAlert,
    runAutomaticProcessing, getFinancialSummary, clearError: () => setError(null)
  };
};

export default useFinancialAutomation;
