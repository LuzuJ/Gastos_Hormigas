import { useState, useEffect, useMemo, useCallback } from 'react';
import { expensesService } from '../services/expensesService';
import type { Expense, ChartData } from '../types';

export interface ExpensesController {
  expenses: Expense[];
  loading: boolean;
  error: string;
  addExpense: (description: string, amount: string, category: string) => Promise<{ success: boolean; error?: string; }>;
  deleteExpense: (expenseId: string) => Promise<void>;
  totalExpensesToday: number;
  chartData: ChartData[];
}

export const useExpensesController = (userId: string | null): ExpensesController => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = expensesService.onExpensesUpdate(userId, (data, err) => {
            if (err) {
                setError("No se pudieron cargar los datos.");
            } else {
                setExpenses(data || []);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);
    
    const addExpense = useCallback(async (description: string, amount: string, category: string) => {
        if (!userId) return { success: false, error: 'Usuario no autenticado.' };
        if (!description.trim() || !amount) {
            return { success: false, error: 'Por favor, ingresa una descripción y un monto.' };
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return { success: false, error: 'Por favor, ingresa un monto válido y mayor a cero.' };
        }

        try {
            await expensesService.addExpense(userId, { 
                description: description.trim(), 
                amount: parsedAmount,
                category: category 
            });
            return { success: true };
        } catch (err) {
            console.error("Error al agregar el gasto:", err);
            return { success: false, error: "Ocurrió un error al guardar el gasto." };
        }
    }, [userId]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (!userId) return;
        try {
            await expensesService.deleteExpense(userId, expenseId);
        } catch (err) {
            console.error("Error al eliminar el gasto:", err);
            setError("No se pudo eliminar el gasto.");
        }
    }, [userId]);

    const totalExpensesToday = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return expenses
            .filter(expense => {
                const expenseDate = expense.createdAt?.toDate();
                if (!expenseDate) return false;
                expenseDate.setHours(0,0,0,0);
                return expenseDate.getTime() === today.getTime();
            })
            .reduce((total, expense) => total + expense.amount, 0);
    }, [expenses]);
    
    const chartData: ChartData[] = useMemo(() => {
        const categoryColors: { [key: string]: string } = {
            'Café': '#8884d8', 'Snacks': '#82ca9d', 'Transporte': '#ffc658',
            'Otro': '#ff8042',
        };

        const grouped = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Otro';
            if (!acc[category]) {
                acc[category] = { name: category, total: 0, fill: categoryColors[category] || categoryColors['Otro'] };
            }
            acc[category].total += expense.amount;
            return acc;
          }, {} as { [key: string]: ChartData });

        return Object.values(grouped);
    }, [expenses]);
    
    return { expenses, loading, error, addExpense, deleteExpense, totalExpensesToday, chartData };
};