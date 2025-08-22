import { useState, useEffect, useCallback, useMemo } from 'react';
import { expensesService } from '../../services/expenses/expensesService';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { Expense, ExpenseFormData } from '../../types';

export const useExpenses = (userId: string | null) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isEditing, setIsEditing] = useState<Expense | null>(null);
    const { 
        loading: loadingExpenses, 
        error: expensesError, 
        startLoading, 
        stopLoading, 
        setErrorState, 
        clearError 
    } = useLoadingState(true);

    useEffect(() => {
        if (!userId) {
            setExpenses([]);
            stopLoading();
            return;
        }

        startLoading();
        clearError();

        const unsubscribe = expensesService.onExpensesUpdate(userId, (data, error) => {
            if (error) {
                setErrorState('Error al cargar los gastos: ' + error.message);
                return;
            }
            setExpenses(data);
            stopLoading();
        });

        return () => unsubscribe();
    }, [userId]); // Solo userId como dependencia

    const addExpense = useCallback(async (data: ExpenseFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }
        
        return await handleAsyncOperation(
            () => expensesService.addExpense(userId, data),
            'Error al guardar el gasto'
        );
    }, [userId]);

    const updateExpense = useCallback(async (expenseId: string, data: Partial<ExpenseFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        return await handleAsyncOperation(
            () => expensesService.updateExpense(userId, expenseId, data),
            'Error al actualizar el gasto'
        );
    }, [userId]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        return await handleAsyncOperation(
            () => expensesService.deleteExpense(userId, expenseId),
            'Error al eliminar el gasto'
        );
    }, [userId]);

    const totalExpensesToday = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return expenses
            .filter(expense => (expense.createdAt?.toDate() ?? new Date(0)) >= todayStart)
            .reduce((total, expense) => total + expense.amount, 0);
    }, [expenses]);

    return {
        expenses,
        isEditing,
        setIsEditing,
        totalExpensesToday,
        // Estados de carga y error
        loadingExpenses,
        expensesError,
        clearExpensesError: clearError,
        // Operaciones
        addExpense,
        updateExpense,
        deleteExpense,
    };
};
