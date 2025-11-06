import { useMemo, useEffect } from 'react';
import type { Expense, Category } from '../../types';
import type { Notification } from '../notifications/useNotifications';

interface UseCombinedCalculationsProps {
  expenses: Expense[];
  categories: Category[];
  totalFixedExpenses: number;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

export const useCombinedCalculations = ({ expenses, categories, totalFixedExpenses, addNotification }: UseCombinedCalculationsProps) => {

  const monthlyExpensesByCategory = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const expensesThisMonth = expenses.filter(e => {
        if (!e.createdAt) return false;
        const expenseDate = new Date(e.createdAt);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    const grouped = expensesThisMonth.reduce((acc, expense) => {
        const categoryName = categories.find(c => c.id === expense.categoryId)?.name || 'Desconocida';
        if (!acc[categoryName]) {
            acc[categoryName] = 0;
        }
        acc[categoryName] += expense.amount;
        return acc;
    }, {} as { [key: string]: number });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [expenses, categories]);

  useEffect(() => {
    const notified = new Set<string>();
    categories.forEach(category => {
        if (category.budget && category.budget > 0) {
            const spent = monthlyExpensesByCategory.find(e => e.name === category.name)?.value || 0;
            const percentage = (spent / category.budget) * 100;
            if (percentage >= 100) {
                const message = `Has superado tu presupuesto de ${category.name}.`;
                if (!notified.has(message)) {
                    addNotification({ message, type: 'danger' });
                    notified.add(message);
                }
            } else if (percentage >= 80) {
                const message = `Estás cerca del 80% de tu presupuesto de ${category.name}.`;
                if (!notified.has(message)) {
                    addNotification({ message, type: 'warning' });
                    notified.add(message);
                }
            }
        }
    });
  }, [monthlyExpensesByCategory, categories, addNotification]);

  const totalExpensesMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const validExpenses = expenses.filter(e => e.createdAt);
    const variableExpensesMonth = validExpenses
        .filter(e => {
            const expenseDate = new Date(e.createdAt!);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);
    return variableExpensesMonth; // El total de fijos se suma aparte en el componente Summary
  }, [expenses]);
  
  const monthlyExpensesTrend = useMemo(() => {
    const trendData: { [key: string]: number } = {};
    const today = new Date();
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear().toString().slice(-2);
        const key = `${monthName} '${year}`;
        trendData[key] = 0;
    }
    const validExpenses = expenses.filter(e => e.createdAt);
    validExpenses.forEach(expense => {
        const expenseDate = new Date(expense.createdAt!);
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        if (expenseDate >= sixMonthsAgo) {
            const monthName = monthNames[expenseDate.getMonth()];
            const year = expenseDate.getFullYear().toString().slice(-2);
            const key = `${monthName} '${year}`;
            if (trendData[key] !== undefined) {
                trendData[key] += expense.amount;
            }
        }
    });
    return Object.entries(trendData).map(([name, total]) => ({ name, total }));
  }, [expenses]);

  const comparativeExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth();
    const lastMonthYear = new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear();
    const dataMap = new Map<string, { name: string; actual: number; anterior: number }>();
    categories.forEach(cat => {
        dataMap.set(cat.id, { name: cat.name, actual: 0, anterior: 0 });
    });
    expenses.forEach(expense => {
        const expenseDate = expense.createdAt ? new Date(expense.createdAt) : null;
        if (!expenseDate) return;
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();
        const categoryData = dataMap.get(expense.categoryId);
        if (categoryData) {
            if (expenseMonth === currentMonth && expenseYear === currentYear) {
                categoryData.actual += expense.amount;
            } else if (expenseMonth === lastMonth && expenseYear === lastMonthYear) {
                categoryData.anterior += expense.amount;
            }
        }
    });
    return Array.from(dataMap.values()).filter(d => d.actual > 0 || d.anterior > 0);
  }, [expenses, categories]);

  return {
    monthlyExpensesByCategory,
    totalExpensesMonth,
    monthlyExpensesTrend,
    comparativeExpenses,
  };
};