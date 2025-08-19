import { useState, useEffect, useCallback, useMemo } from 'react';
import { financialsService } from '../services/financialsService';
import { fixedExpenseService } from '../services/fixedExpenseService';
import { useLoadingState, handleAsyncOperation } from './useLoadingState';
import type { Financials, FixedExpense } from '../types';

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
        const unsubFinancials = financialsService.onFinancialsUpdate(userId, (data) => {
            setFinancials(data);
            stopLoading();
        });

        // Suscripción a gastos fijos
        const unsubFixed = fixedExpenseService.onFixedExpensesUpdate(userId, (data) => {
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
            () => financialsService.setMonthlyIncome(userId, income),
            'Error al actualizar el ingreso mensual'
        );
    }, [userId]);

    const addFixedExpense = useCallback(async (data: Omit<FixedExpense, 'id'>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => fixedExpenseService.addFixedExpense(userId, data),
            'Error al agregar el gasto fijo'
        );
    }, [userId]);

    const deleteFixedExpense = useCallback(async (id: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => fixedExpenseService.deleteFixedExpense(userId, id),
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
    };
};