import { useState, useEffect, useCallback, useMemo } from 'react';
import { expenseServiceRepo } from '../../services/expense/expenseServiceRepo';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { Expense, ExpenseFormData } from '../../types';

/**
 * Hook personalizado para la gestión de gastos utilizando el patrón repositorio
 * Proporciona funcionalidad para cargar, crear, actualizar y eliminar gastos
 */
export const useExpensesRepo = (userId: string | null) => {
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

        const unsubscribe = expenseServiceRepo.onExpensesUpdate(userId, (data, error) => {
            if (error) {
                setErrorState('Error al cargar los gastos: ' + error.message);
                return;
            }
            setExpenses(data);
            stopLoading();
        });

        return () => unsubscribe();
    }, [userId, startLoading, stopLoading, clearError, setErrorState]);

    const addExpense = useCallback(async (data: ExpenseFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }
        
        return await handleAsyncOperation(
            () => expenseServiceRepo.addExpense(userId, data),
            'Error al guardar el gasto'
        );
    }, [userId]);

    const updateExpense = useCallback(async (expenseId: string, data: Partial<ExpenseFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        return await handleAsyncOperation(
            () => expenseServiceRepo.updateExpense(userId, expenseId, data),
            'Error al actualizar el gasto'
        );
    }, [userId]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        return await handleAsyncOperation(
            () => expenseServiceRepo.deleteExpense(userId, expenseId),
            'Error al eliminar el gasto'
        );
    }, [userId]);

    const totalExpensesToday = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return expenses
            .filter(expense => {
                // Manejar strings ISO de Supabase
                if (!expense.createdAt) return false;
                
                let createdDate: Date;
                if (typeof expense.createdAt === 'string') {
                    createdDate = new Date(expense.createdAt);
                } else {
                    // Fallback para cualquier otro tipo
                    createdDate = new Date(0);
                }
                
                return createdDate >= todayStart;
            })
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
