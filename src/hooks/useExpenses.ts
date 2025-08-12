import { useState, useEffect, useCallback, useMemo } from 'react';
import { expensesService } from '../services/expensesService';
import type { Expense, ExpenseFormData } from '../types';

export const useExpenses = (userId: string | null) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isEditing, setIsEditing] = useState<Expense | null>(null);

    useEffect(() => {
        if (!userId) {
            setExpenses([]);
            return;
        }
        const unsubscribe = expensesService.onExpensesUpdate(userId, (data) => setExpenses(data));
        return () => unsubscribe();
    }, [userId]);

    const addExpense = useCallback(async (data: ExpenseFormData) => {
        if (!userId) return { success: false, error: 'Usuario no autenticado.' };
        try {
            await expensesService.addExpense(userId, data);
            return { success: true };
        } catch (err) {
            return { success: false, error: "Ocurrió un error al guardar." };
        }
    }, [userId]);

    const updateExpense = useCallback(async (expenseId: string, data: Partial<ExpenseFormData>) => {
        if (!userId) return { success: false, error: 'Usuario no autenticado.' };
        try {
            await expensesService.updateExpense(userId, expenseId, data);
            return { success: true };
        } catch (err) {
            return { success: false, error: "Ocurrió un error al actualizar." };
        }
    }, [userId]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (!userId) return;
        await expensesService.deleteExpense(userId, expenseId);
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
        addExpense,
        updateExpense,
        deleteExpense,
    };
};