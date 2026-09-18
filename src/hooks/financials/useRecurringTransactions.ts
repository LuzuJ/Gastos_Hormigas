
import { useEffect } from 'react';
import { useExpensesContext, useFinancialsContext } from '../../contexts/AppContext';

export const useRecurringTransactions = (userId: string | undefined) => {
    const { fixedExpenses, updateFixedExpense } = useFinancialsContext();
    const { addExpense } = useExpensesContext();

    useEffect(() => {
        if (!userId || fixedExpenses.length === 0) return;

        const checkRecurringExpenses = async () => {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const currentDay = now.getDate();

            console.log('[Recurring] Checking fixed expenses for', currentMonth);

            for (const expense of fixedExpenses) {
                // Check if expense has already been processed for this month
                if (expense.lastPostedMonth === currentMonth) {
                    continue;
                }

                // Check if today is or past the due day
                if (currentDay >= expense.dayOfMonth) {
                    console.log(`[Recurring] Processing due expense: ${expense.description}`);

                    try {
                        // 1. Create the real expense
                        await addExpense({
                            description: expense.description,
                            amount: expense.amount,
                            categoryId: expense.category, // Assuming category is ID. If name, might need lookup.
                            subCategory: 'Gasto Fijo',
                            createdAt: new Date().toISOString(), // Use ISO string for Supabase
                            paymentSourceId: undefined // Fallback to default
                        });

                        // 2. Update the fixed expense tracking
                        await updateFixedExpense(expense.id, {
                            lastPostedMonth: currentMonth
                        });

                        console.log(`[Recurring] Successfully processed: ${expense.description}`);
                    } catch (error) {
                        console.error(`[Recurring] Failed to process ${expense.description}:`, error);
                    }
                }
            }
        };

        checkRecurringExpenses();
    }, [userId, fixedExpenses.length]); // Check on mount and when list changes (loaded)
};
