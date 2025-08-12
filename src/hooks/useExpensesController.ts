import { useState, useEffect, useMemo, useCallback } from 'react';
import { expensesService } from '../services/expensesService';
import { categoryService } from '../services/categoryService';
import { financialsService } from '../services/financialsService';
import { fixedExpenseService } from '../services/fixedExpenseService';
import type { Expense, Category, ExpenseFormData, 
    Financials, FixedExpense } from '../types';

// La interfaz pública del hook vuelve a su versión anterior
export interface ExpensesController {
    expenses: Expense[];
    categories: Category[];
    financials: Financials | null;
    fixedExpenses: FixedExpense[];
    loading: boolean;
    error: string;
    addExpense: (data: ExpenseFormData) => Promise<{ success: boolean; error?: string; }>;
    addFixedExpense: (data: Omit<FixedExpense, 'id'>) => Promise<void>;
    updateExpense: (expenseId: string, data: Partial<ExpenseFormData>) => Promise<{ success: boolean; error?: string; }>;
    deleteExpense: (expenseId: string) => Promise<void>;
    addCategory: (categoryName: string) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    addSubCategory: (categoryId: string, subCategoryName: string) => Promise<void>; 
    deleteSubCategory: (categoryId: string, subCategoryId: string) => Promise<void>; 
    updateCategoryBudget: (categoryId: string, budget: number) => Promise<void>;
    setMonthlyIncome: (income: number) => Promise<void>;
    deleteFixedExpense: (id: string) => Promise<void>;
    isEditing: Expense | null;
    setIsEditing: React.Dispatch<React.SetStateAction<Expense | null>>;
    totalFixedExpenses: number;
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
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);

    useEffect(() => {
        if (!userId) {
            setExpenses([]);
            setCategories([]);
            setFinancials(null);
            setFixedExpenses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribeExpenses = expensesService.onExpensesUpdate(userId, (data, err) => {
            if (err) setError("No se pudieron cargar los datos de gastos.");
            else setExpenses(data || []);
            setLoading(false);
        });

         const unsubCategories = categoryService.onCategoriesUpdate(userId, (data) => {
            setCategories(data || []);
        });

        const unsubscribeCategories = categoryService.onCategoriesUpdate(userId, (data) => {
            setCategories(data || []);
        });

        const unsubFinancials = financialsService.onFinancialsUpdate(userId, (data, err) => {
            if (err) setError("No se pudieron cargar los datos financieros.");
            else setFinancials(data);
        });

        const unsubFixedExpenses = fixedExpenseService.onFixedExpensesUpdate(userId, (data, err) => {
            if (err) setError("No se pudieron cargar los gastos fijos.");
            else setFixedExpenses(data || []);
        });

        return () => {
            unsubscribeExpenses();
            unsubscribeCategories();
            unsubFinancials();
            unsubFixedExpenses();
            unsubCategories();
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

    const addFixedExpense = useCallback(async (data: Omit<FixedExpense, 'id'>) => {
        if (!userId) return;
        try {
            await fixedExpenseService.addFixedExpense(userId, data);
        } catch (err) {
            console.error(err);
            setError("No se pudo añadir el gasto fijo.");
        }
    }, [userId]);

    const updateCategoryBudget = useCallback(async (categoryId: string, budget: number) => {
        if (!userId || budget < 0) return;
        try {
            await categoryService.updateCategoryBudget(userId, categoryId, budget);
        } catch (err) {
            console.error(err);
            setError("No se pudo actualizar el presupuesto.");
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

    const deleteFixedExpense = useCallback(async (id: string) => {
        if (!userId) return;
        try {
            await fixedExpenseService.deleteFixedExpense(userId, id);
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar el gasto fijo.");
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

    const totalFixedExpenses = useMemo(() => {
        return fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [fixedExpenses]);

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

        const variableExpensesMonth = expenses
            .filter(e => {
                const expenseDate = e.createdAt?.toDate();
                return expenseDate && expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
        
        // Sumamos los gastos variables del mes + el total de gastos fijos
        return variableExpensesMonth + totalFixedExpenses;
    }, [expenses, totalFixedExpenses]);

    const addSubCategory = useCallback(async (categoryId: string, subCategoryName: string) => {
        if (!userId || !subCategoryName.trim()) return;
        try {
            await categoryService.addSubCategory(userId, categoryId, subCategoryName.trim());
        } catch(err) {
            console.error(err);
            setError("No se pudo añadir la subcategoría.");
        }
    }, [userId]);

    const deleteSubCategory = useCallback(async (categoryId: string, subCategoryId: string) => {
        if (!userId) return;
        try {
            await categoryService.deleteSubCategory(userId, categoryId, subCategoryId);
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar la subcategoría.");
        }
    }, [userId]);

    return { 
        expenses, categories, loading, error, 
        addExpense, updateExpense, deleteExpense,
        addCategory, deleteCategory, setMonthlyIncome,
        isEditing, setIsEditing, totalExpensesToday,
        financials, totalExpensesMonth, totalFixedExpenses,
        fixedExpenses, addFixedExpense, deleteFixedExpense,
        addSubCategory, deleteSubCategory, updateCategoryBudget
    };
};
