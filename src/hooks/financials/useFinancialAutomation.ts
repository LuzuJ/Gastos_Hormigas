import { useState, useEffect, useCallback, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { createFinancialAutomationService } from '../../services/financials/financialAutomationService';
import toast from 'react-hot-toast';
import type { 
  RecurringIncome, 
  FinancialAlert, 
  PaymentSourceBalance, 
  Transaction,
  EnhancedExpense
} from '../../types';

export const useFinancialAutomation = (userId: string | null) => {
  const serviceRef = useRef<ReturnType<typeof createFinancialAutomationService> | null>(null);
  
  // Estados
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncome[]>([]);
  const [financialAlerts, setFinancialAlerts] = useState<FinancialAlert[]>([]);
  const [paymentSourceBalances, setPaymentSourceBalances] = useState<PaymentSourceBalance[]>([]);
  const [isProcessingAutomatic, setIsProcessingAutomatic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar servicio
  useEffect(() => {
    if (userId) {
      serviceRef.current = createFinancialAutomationService(userId);
    }
  }, [userId]);

  // Suscribirse a alertas financieras
  useEffect(() => {
    if (!serviceRef.current) return;

    const unsubscribe = serviceRef.current.subscribeToAlerts((alerts) => {
      setFinancialAlerts(alerts);
      
      // Mostrar notificaciones para alertas críticas nuevas
      alerts.forEach(alert => {
        if (alert.severity === 'critical' && !alert.isRead) {
          toast.error(alert.message, {
            duration: 8000,
            position: 'top-right'
          });
        }
      });
    });

    return unsubscribe;
  }, [serviceRef.current]);

  // === BALANCE MANAGEMENT ===

  /**
   * Procesa un gasto con descuento automático de saldo
   */
  const processExpenseWithBalance = useCallback(async (
    expense: EnhancedExpense,
    paymentSourceId: string
  ) => {
    if (!serviceRef.current) {
      throw new Error('Servicio no inicializado');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await serviceRef.current.processExpenseWithBalance(expense, paymentSourceId);
      
      if (result.success) {
        toast.success(
          `Gasto procesado. Nuevo saldo: $${result.newBalance?.toFixed(2)}`,
          { duration: 4000 }
        );
        
        // Actualizar proyecciones de saldo
        await refreshPaymentSourceBalance(paymentSourceId);
      } else {
        toast.error(result.error || 'Error procesando el gasto');
        setError(result.error || 'Error procesando el gasto');
      }

      return result;
    } catch (error) {
      const errorMessage = 'Error procesando el gasto';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza manualmente el saldo de una fuente de pago
   */
  const updatePaymentSourceBalance = useCallback(async (
    paymentSourceId: string,
    newBalance: number,
    description?: string
  ) => {
    if (!serviceRef.current) {
      throw new Error('Servicio no inicializado');
    }

    setLoading(true);
    setError(null);

    try {
      const transaction: Transaction = {
        id: '', // Se asignará automáticamente
        type: 'transfer',
        amount: 0, // Se calculará en el servicio
        description: description || 'Actualización manual de saldo',
        date: Timestamp.now(),
        toPaymentSourceId: paymentSourceId,
        isAutomatic: false
      };

      await serviceRef.current.updatePaymentSourceBalance(
        paymentSourceId, 
        newBalance, 
        transaction
      );

      toast.success('Saldo actualizado correctamente');
      await refreshPaymentSourceBalance(paymentSourceId);
    } catch (error) {
      const errorMessage = 'Error actualizando el saldo';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // === RECURRING INCOME MANAGEMENT ===

  /**
   * Crea un nuevo ingreso recurrente
   */
  const createRecurringIncome = useCallback(async (
    incomeData: Omit<RecurringIncome, 'id'>
  ) => {
    if (!serviceRef.current) {
      throw new Error('Servicio no inicializado');
    }

    setLoading(true);
    setError(null);

    try {
      const id = await serviceRef.current.createRecurringIncome(incomeData);
      toast.success('Ingreso recurrente creado correctamente');
      
      // Actualizar lista de ingresos recurrentes
      await loadRecurringIncomes();
      
      return id;
    } catch (error) {
      const errorMessage = 'Error creando el ingreso recurrente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Procesa todos los ingresos recurrentes pendientes
   */
  const processAllRecurringIncomes = useCallback(async () => {
    if (!serviceRef.current) {
      throw new Error('Servicio no inicializado');
    }

    setIsProcessingAutomatic(true);
    setError(null);

    try {
      await serviceRef.current.processRecurringIncomes();
      toast.success('Ingresos recurrentes procesados');
      
      // Actualizar balances y alertas
      await Promise.all([
        loadRecurringIncomes(),
        refreshAllPaymentSourceBalances()
      ]);
    } catch (error) {
      const errorMessage = 'Error procesando ingresos recurrentes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessingAutomatic(false);
    }
  }, []);

  // === ALERTS MANAGEMENT ===

  /**
   * Marca una alerta como leída
   */
  const markAlertAsRead = useCallback(async (alertId: string) => {
    if (!serviceRef.current) return;

    try {
      await serviceRef.current.markAlertAsRead(alertId);
      setFinancialAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }, []);

  /**
   * Crea una alerta manual
   */
  const createAlert = useCallback(async (
    alertData: Omit<FinancialAlert, 'id' | 'isRead' | 'createdAt'>
  ) => {
    if (!serviceRef.current) {
      throw new Error('Servicio no inicializado');
    }

    try {
      await serviceRef.current.createAlert(alertData);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }, []);

  // === BALANCE PROJECTIONS ===

  /**
   * Actualiza la proyección de saldo para una fuente específica
   */
  const refreshPaymentSourceBalance = useCallback(async (
    paymentSourceId: string,
    days: number = 30
  ) => {
    if (!serviceRef.current) return;

    try {
      const balance = await serviceRef.current.getPaymentSourceProjection(paymentSourceId, days);
      setPaymentSourceBalances(prev => {
        const index = prev.findIndex(b => b.paymentSourceId === paymentSourceId);
        if (index >= 0) {
          const newBalances = [...prev];
          newBalances[index] = balance;
          return newBalances;
        } else {
          return [...prev, balance];
        }
      });
    } catch (error) {
      console.error('Error refreshing payment source balance:', error);
    }
  }, []);

  /**
   * Actualiza todas las proyecciones de saldo
   */
  const refreshAllPaymentSourceBalances = useCallback(async () => {
    // Esta función debería ser llamada con la lista de payment sources activos
    // Por ahora, mantenemos el estado actual
    console.log('Refreshing all payment source balances...');
  }, []);

  // === DATA LOADING ===

  /**
   * Carga los ingresos recurrentes del usuario
   */
  const loadRecurringIncomes = useCallback(async () => {
    // Implementar carga de ingresos recurrentes
    // Por ahora, mantener estado vacío hasta implementar la query
    setRecurringIncomes([]);
  }, []);

  // === AUTOMATED PROCESSING ===

  /**
   * Ejecuta el procesamiento automático completo
   */
  const runAutomaticProcessing = useCallback(async () => {
    setIsProcessingAutomatic(true);
    
    try {
      await Promise.all([
        processAllRecurringIncomes(),
        // Agregar aquí otros procesamientos automáticos como:
        // - Procesar transacciones automáticas
        // - Verificar vencimientos de deudas
        // - Generar alertas preventivas
      ]);

      toast.success('Procesamiento automático completado', {
        icon: '🤖'
      });
    } catch (error) {
      toast.error('Error en el procesamiento automático');
    } finally {
      setIsProcessingAutomatic(false);
    }
  }, [processAllRecurringIncomes]);

  // === SUMMARY CALCULATIONS ===

  /**
   * Calcula resumen financiero con alertas
   */
  const getFinancialSummary = useCallback(() => {
    const totalBalance = paymentSourceBalances.reduce(
      (sum, balance) => sum + balance.currentBalance, 0
    );
    
    const projectedBalance = paymentSourceBalances.reduce(
      (sum, balance) => sum + balance.projectedBalance, 0
    );

    const criticalAlerts = financialAlerts.filter(
      alert => alert.severity === 'critical' && !alert.isRead
    ).length;

    const highAlerts = financialAlerts.filter(
      alert => alert.severity === 'high' && !alert.isRead
    ).length;

    return {
      totalBalance,
      projectedBalance,
      balanceChange: projectedBalance - totalBalance,
      unreadAlerts: financialAlerts.filter(alert => !alert.isRead).length,
      criticalAlerts,
      highAlerts,
      hasLowBalanceWarning: paymentSourceBalances.some(
        balance => balance.currentBalance < 100
      )
    };
  }, [paymentSourceBalances, financialAlerts]);

  return {
    // Estados
    recurringIncomes,
    financialAlerts,
    paymentSourceBalances,
    isProcessingAutomatic,
    loading,
    error,

    // Acciones de balance
    processExpenseWithBalance,
    updatePaymentSourceBalance,
    refreshPaymentSourceBalance,
    refreshAllPaymentSourceBalances,

    // Acciones de ingresos recurrentes
    createRecurringIncome,
    processAllRecurringIncomes,

    // Acciones de alertas
    markAlertAsRead,
    createAlert,

    // Procesamiento automático
    runAutomaticProcessing,

    // Resumen
    getFinancialSummary,

    // Utilidades
    clearError: () => setError(null)
  };
};

export default useFinancialAutomation;
