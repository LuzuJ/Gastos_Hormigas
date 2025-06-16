import { useState, useEffect, useMemo, useCallback } from 'react';
import { expensesService } from '../services/expensesService';
import { categoryService } from '../services/categoryService';
import { financialsService } from '../services/financialsService';
import type { Expense, Category, ExpenseFormData, Financials } from '../types';

// La interfaz pública del hook vuelve a su versión anterior
export interface ExpensesController {
    expenses: Expense[];
    categories: Category[];
    financials: Financials | null;
    loading: boolean;
    error: string;
    addExpense: (data: ExpenseFormData) => Promise<{ success: boolean; error?: string; }>;
    updateExpense: (expenseId: string, data: Partial<ExpenseFormData>) => Promise<{ success: boolean; error?: string; }>;
    deleteExpense: (expenseId: string) => Promise<void>;
    addCategory: (categoryName: string) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    setMonthlyIncome: (income: number) => Promise<void>;
    isEditing: Expense | null;
    setIsEditing: React.Dispatch<React.SetStateAction<Expense | null>>;
    totalExpensesToday: number;
    totalExpensesMonth: number;
}

export const useExpensesController = (userId: string | null): ExpensesController => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [isEditing, setIsEditing] = useState<Expense | null>(null);
    const [financials, setFinancials] = useState<Financials | null>(null);

    useEffect(() => {
        if (!userId) {
            setExpenses([]);
            setCategories([]);
            setFinancials(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribeExpenses = expensesService.onExpensesUpdate(userId, (data, err) => {
            if (err) setError("No se pudieron cargar los datos de gastos.");
            else setExpenses(data || []);
            setLoading(false);
        });

        const unsubscribeCategories = categoryService.onCategoriesUpdate(userId, (data, err) => {
            if (err) setError("No se pudieron cargar las categorías.");
            else setCategories(data || []);
        });

        const unsubFinancials = financialsService.onFinancialsUpdate(userId, (data, err) => {
            if (err) setError("No se pudieron cargar los datos financieros.");
            else setFinancials(data);
        });

        return () => {
            unsubscribeExpenses();
            unsubscribeCategories();
            unsubFinancials();
        };
    }, [userId]);
    
    // Todas las funciones de gastos y categorías se mantienen igual
    const addExpense = useCallback(async (data: ExpenseFormData) => {
        if (!userId) return { success: false, error: 'Usuario no autenticado.' };
        if (!data.description.trim() || !data.amount) return { success: false, error: 'Descripción y monto son requeridos.' };
        if (data.amount <= 0) return { success: false, error: 'El monto debe ser mayor a cero.' };
        try {
            await expensesService.addExpense(userId, data);
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: "Ocurrió un error al guardar." };
        }
    }, [userId]);
    
    const updateExpense = useCallback(async (expenseId: string, data: Partial<ExpenseFormData>) => {
        if (!userId) return { success: false, error: 'Usuario no autenticado.' };
        try {
            await expensesService.updateExpense(userId, expenseId, data);
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: "Ocurrió un error al actualizar." };
        }
    }, [userId]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (!userId) return;
        try {
            await expensesService.deleteExpense(userId, expenseId);
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar el gasto.");
        }
    }, [userId]);
    
    const addCategory = useCallback(async (categoryName: string) => {
        if (!userId || !categoryName.trim()) return;
        try {
            await categoryService.addCategory(userId, categoryName.trim());
        } catch(err) {
            console.error(err);
            setError("No se pudo añadir la categoría.");
        }
    }, [userId]);

    const deleteCategory = useCallback(async (categoryId: string) => {
        if (!userId) return;
        try {
            await categoryService.deleteCategory(userId, categoryId);
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar la categoría.");
        }
    }, [userId]);

    const setMonthlyIncome = useCallback(async (income: number) => {
        if (!userId || income < 0) return;
        try {
            await financialsService.setMonthlyIncome(userId, income);
        } catch(err) {
            console.error(err);
            setError("No se pudo guardar el ingreso mensual.");
        }
    }, [userId]);

    const totalExpensesToday = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return expenses
            .filter(expense => (expense.createdAt?.toDate() ?? new Date(0)) >= todayStart)
            .reduce((total, expense) => total + expense.amount, 0);
    }, [expenses]);

    const totalExpensesMonth = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expenses
            .filter(e => {
                const expenseDate = e.createdAt?.toDate();
                return expenseDate && expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    return { 
        expenses, categories, loading, error, 
        addExpense, updateExpense, deleteExpense,
        addCategory, deleteCategory, setMonthlyIncome,
        isEditing, setIsEditing, totalExpensesToday,
        financials, totalExpensesMonth
    };
};
