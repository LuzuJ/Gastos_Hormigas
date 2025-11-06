import { useState, useEffect, useCallback, useMemo } from 'react';
import { financialsServiceRepo } from '../../services/financials/financialsServiceRepo';
import { fixedExpenseServiceRepo } from '../../services/expenses/fixedExpenseServiceRepo';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import { usePaymentSources } from '../expenses/usePaymentSources';
import type { Financials, FixedExpense } from '../../types';

export const useFinancials = (userId: string | null) => {
    const [financials, setFinancials] = useState<Financials | null>(null);
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const { 
        loading: loadingFinancials, 
        error: financialsError, 
        startLoading, 
        stopLoading, 
        clearError 
    } = useLoadingState(true);
    
    const [loadingFixedExpenses, setLoadingFixedExpenses] = useState(true);
    const [fixedExpensesError, setFixedExpensesError] = useState<string | null>(null);

    // Hook para fuentes de pago
    const {
        paymentSources,
        loadingPaymentSources,
        paymentSourcesError,
        clearPaymentSourcesError,
        addPaymentSource,
        updatePaymentSource,
        deletePaymentSource,
        updateBalance,
        toggleActive,
        getActivePaymentSources,
        getPaymentSourceById
    } = usePaymentSources(userId);

    useEffect(() => {
        if (!userId) {
            setFinancials(null);
            setFixedExpenses([]);
            stopLoading();
            setLoadingFixedExpenses(false);
            return;
        }

        startLoading();
        setLoadingFixedExpenses(true);
        clearError();
        setFixedExpensesError(null);

        // Suscripción a datos financieros
        const unsubFinancials = financialsServiceRepo.onFinancialsUpdate(userId, (data: Financials | null) => {
            setFinancials(data);
            stopLoading();
        });

        // Suscripción a gastos fijos
        const unsubFixed = fixedExpenseServiceRepo.onFixedExpensesUpdate(userId, (data: FixedExpense[]) => {
            setFixedExpenses(data);
            setLoadingFixedExpenses(false);
        });

        return () => {
            unsubFinancials();
            unsubFixed();
        };
    }, [userId, startLoading, stopLoading, clearError]);

    const setMonthlyIncome = useCallback(async (income: number) => {
        if (!userId || income < 0) {
            return { success: false, error: 'Datos inválidos o usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => financialsServiceRepo.setMonthlyIncome(userId, income),
            'Error al establecer el ingreso mensual'
        );
    }, [userId]);

    const addFixedExpense = useCallback(async (data: Omit<FixedExpense, 'id'>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => fixedExpenseServiceRepo.addFixedExpense(userId, data),
            'Error al agregar el gasto fijo'
        );
    }, [userId]);

    const deleteFixedExpense = useCallback(async (id: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => fixedExpenseServiceRepo.deleteFixedExpense(userId, id),
            'Error al eliminar el gasto fijo'
        );
    }, [userId]);

    const totalFixedExpenses = useMemo(() => {
        return fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [fixedExpenses]);

    const clearFixedExpensesError = useCallback(() => {
        setFixedExpensesError(null);
    }, []);

    return {
        financials,
        fixedExpenses,
        totalFixedExpenses,
        // Estados de carga y error
        loadingFinancials,
        financialsError,
        loadingFixedExpenses,
        fixedExpensesError,
        clearFinancialsError: clearError,
        clearFixedExpensesError,
        // Operaciones
        setMonthlyIncome,
        addFixedExpense,
        deleteFixedExpense,
        // Fuentes de pago
        paymentSources,
        loadingPaymentSources,
        paymentSourcesError,
        clearPaymentSourcesError,
        addPaymentSource,
        updatePaymentSource,
        deletePaymentSource,
        updateBalance,
        toggleActive,
        getActivePaymentSources,
        getPaymentSourceById
    };
};