import { useState, useEffect, useMemo } from 'react';
import { useExpenses } from './useExpenses';
import { useCategories } from './useCategories';
import { useFinancials } from './useFinancials';
import { useUserProfile } from './useUserProfile';
import { useSavingsGoals } from './useSavingsGoals';

export const useExpensesController = (userId: string | null) => {
    // 1. Usamos nuestros nuevos hooks especializados
    const { expenses, ...expenseActions } = useExpenses(userId);
    const { categories, ...categoryActions } = useCategories(userId);
    const { financials, fixedExpenses, totalFixedExpenses, ...financialsActions } = useFinancials(userId);
    const { savingsGoals, ...savingsGoalActions } = useSavingsGoals(userId);
    const { profile, ...profileActions } = useUserProfile(userId);

    // 2. El estado de carga y error se puede manejar aquí o en cada hook individual
    // Por simplicidad, lo manejamos aquí por ahora, asumiendo que todos cargan juntos.
    const [loading, setLoading] = useState(true);
    const [error] = useState(''); // Puedes conectar esto a los hooks si devuelven errores

    useEffect(() => {
        // Un simple efecto para simular el fin de la carga inicial
        if (userId) {
            // Una mejor implementación podría esperar a que todos los datos lleguen por primera vez
            setTimeout(() => setLoading(false), 1500); 
        } else {
            setLoading(false);
        }
    }, [userId]);

    // 3. Los cálculos que dependen de múltiples hooks se quedan aquí
    const totalExpensesMonth = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const variableExpensesMonth = expenses
            .filter(e => {
                const expenseDate = e.createdAt?.toDate();
                return expenseDate && expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        return variableExpensesMonth + totalFixedExpenses;
    }, [expenses, totalFixedExpenses]);

    const monthlyExpensesByCategory = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expensesThisMonth = expenses.filter(e => {
        const expenseDate = e.createdAt?.toDate();
        return expenseDate && expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const grouped = expensesThisMonth.reduce((acc, expense) => {
        const categoryName = categories.find(c => c.id === expense.categoryId)?.name || 'Desconocida';
        if (!acc[categoryName]) {
            acc[categoryName] = 0;
        }
        acc[categoryName] += expense.amount;
        return acc;
    }, {} as { [key: string]: number });

    return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
    }));
    }, [expenses, categories]);

    const monthlyExpensesTrend = useMemo(() => {
        const trendData: { [key: string]: number } = {};
        const today = new Date();
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        // Filtramos gastos de los últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = monthNames[date.getMonth()];
            const year = date.getFullYear().toString().slice(-2);
            const key = `${monthName} '${year}`;
            trendData[key] = 0; // Inicializamos el mes
        }

        expenses.forEach(expense => {
            const expenseDate = expense.createdAt?.toDate();
            if (expenseDate) {
                const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
                if (expenseDate >= sixMonthsAgo) {
                    const monthName = monthNames[expenseDate.getMonth()];
                    const year = expenseDate.getFullYear().toString().slice(-2);
                    const key = `${monthName} '${year}`;
                    if (trendData[key] !== undefined) {
                        trendData[key] += expense.amount;
                    }
                }
            }
        });

        return Object.entries(trendData).map(([name, total]) => ({
            name,
            total,
        }));
    }, [expenses]);

    const comparativeExpenses = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth();
        const lastMonthYear = new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear();

        const dataMap = new Map<string, { name: string; actual: number; anterior: number }>();

        // Pre-poblamos el mapa con todas las categorías para asegurar que aparezcan
        categories.forEach(cat => {
            dataMap.set(cat.id, { name: cat.name, actual: 0, anterior: 0 });
        });

        expenses.forEach(expense => {
            const expenseDate = expense.createdAt.toDate();
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




    // 4. Devolvemos una interfaz idéntica a la anterior
    return {
        expenses,
        profile,
        categories,
        financials,
        fixedExpenses,
        savingsGoals,
        loading,
        error,
        totalFixedExpenses,
        monthlyExpensesTrend,
        totalExpensesMonth,
        comparativeExpenses,
        monthlyExpensesByCategory,
        ...expenseActions,
        ...categoryActions,
        ...profileActions,
        ...financialsActions,
        ...savingsGoalActions,
    };
};