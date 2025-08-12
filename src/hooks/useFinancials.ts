import { useState, useEffect, useCallback, useMemo } from 'react';
import { financialsService } from '../services/financialsService';
import { fixedExpenseService } from '../services/fixedExpenseService';
import type { Financials, FixedExpense } from '../types';

export const useFinancials = (userId: string | null) => {
    const [financials, setFinancials] = useState<Financials | null>(null);
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);

    useEffect(() => {
        if (!userId) {
            setFinancials(null);
            setFixedExpenses([]);
            return;
        }
        const unsubFinancials = financialsService.onFinancialsUpdate(userId, (data) => setFinancials(data));
        const unsubFixed = fixedExpenseService.onFixedExpensesUpdate(userId, (data) => setFixedExpenses(data));
        return () => {
            unsubFinancials();
            unsubFixed();
        };
    }, [userId]);

    const setMonthlyIncome = useCallback(async (income: number) => {
        if (!userId || income < 0) return;
        await financialsService.setMonthlyIncome(userId, income);
    }, [userId]);

    const addFixedExpense = useCallback(async (data: Omit<FixedExpense, 'id'>) => {
        if (!userId) return;
        await fixedExpenseService.addFixedExpense(userId, data);
    }, [userId]);

    const deleteFixedExpense = useCallback(async (id: string) => {
        if (!userId) return;
        await fixedExpenseService.deleteFixedExpense(userId, id);
    }, [userId]);

    const totalFixedExpenses = useMemo(() => {
        return fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [fixedExpenses]);

    return {
        financials,
        fixedExpenses,
        totalFixedExpenses,
        setMonthlyIncome,
        addFixedExpense,
        deleteFixedExpense,
    };
};