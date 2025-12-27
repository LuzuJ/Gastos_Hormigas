import { useState, useEffect, useCallback, useMemo } from 'react';
import { expenseServiceRepo } from '../../services/expense/expenseServiceRepo';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { Expense, ExpenseFormData } from '../../types';

export const useExpenses = (userId: string | null) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isEditing, setIsEditing] = useState<Expense | null>(null);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const [expensesError, setExpensesError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setExpenses([]);
            setLoadingExpenses(false);
            return;
        }

        setLoadingExpenses(true);
        setExpensesError(null);

        const unsubscribe = expenseServiceRepo.onExpensesUpdate(userId, (data: Expense[], error?: Error) => {
            if (error) {
                setExpensesError('Error al cargar los gastos. Intenta recargar la página.');
                setLoadingExpenses(false);
                return;
            }
            setExpenses(data || []);
            setLoadingExpenses(false);
        });

        return () => {
            unsubscribe();
        };
    }, [userId]);

    const addExpense = useCallback(async (data: ExpenseFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        const result = await handleAsyncOperation(
            () => expenseServiceRepo.addExpense(userId, data),
            'Error al agregar el gasto'
        );

        // Si fue exitoso, recargar los gastos manualmente (fallback por si falla realtime)
        if (result.success) {
            console.log('[useExpenses] Gasto agregado, recargando lista...');
            try {
                // Pequeña espera para asegurar que los datos fueron escritos en la BD
                await new Promise(resolve => setTimeout(resolve, 300));
                const updatedExpenses = await expenseServiceRepo.getExpenses(userId);
                setExpenses(updatedExpenses);
            } catch (error) {
                console.error('[useExpenses] Error recargando gastos:', error);
            }
        }

        return result;
    }, [userId]);

    const updateExpense = useCallback(async (expenseId: string, data: Partial<ExpenseFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        const result = await handleAsyncOperation(
            () => expenseServiceRepo.updateExpense(userId, expenseId, data),
            'Error al actualizar el gasto'
        );

        // Si fue exitoso, recargar los gastos manualmente (fallback por si falla realtime)
        if (result.success) {
            console.log('[useExpenses] Gasto actualizado, recargando lista...');
            try {
                // Pequeña espera para asegurar que los datos fueron actualizados en la BD
                await new Promise(resolve => setTimeout(resolve, 300));
                const updatedExpenses = await expenseServiceRepo.getExpenses(userId);
                setExpenses(updatedExpenses);
            } catch (error) {
                console.error('[useExpenses] Error recargando gastos:', error);
            }
        }

        return result;
    }, [userId]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        const result = await handleAsyncOperation(
            () => expenseServiceRepo.deleteExpense(userId, expenseId),
            'Error al eliminar el gasto'
        );

        // Si fue exitoso, recargar los gastos manualmente (fallback por si falla realtime)
        if (result.success) {
            console.log('[useExpenses] Gasto eliminado, recargando lista...');
            try {
                // Pequeña espera para asegurar que los datos fueron eliminados de la BD
                await new Promise(resolve => setTimeout(resolve, 300));
                const updatedExpenses = await expenseServiceRepo.getExpenses(userId);
                setExpenses(updatedExpenses);
            } catch (error) {
                console.error('[useExpenses] Error recargando gastos:', error);
            }
        }

        return result;
    }, [userId]);

    const totalExpensesToday = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return expenses
            .filter(expense => {
                const expenseDate = expense.createdAt ? new Date(expense.createdAt) : new Date(0);
                return expenseDate >= todayStart;
            })
            .reduce((total, expense) => total + expense.amount, 0);
    }, [expenses]);

    const clearExpensesError = useCallback(() => {
        setExpensesError(null);
    }, []);

    return {
        expenses,
        isEditing,
        setIsEditing,
        totalExpensesToday,
        // Estados de carga y error
        loadingExpenses,
        expensesError,
        clearExpensesError,
        // Operaciones
        addExpense,
        updateExpense,
        deleteExpense,
    };
};
