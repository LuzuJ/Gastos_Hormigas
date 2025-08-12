import { fixedExpenseService } from './fixedExpenseService';
import { expensesService } from './expensesService';
import { Timestamp } from 'firebase/firestore';
import type { Category } from '../types';

export const automationService = {
  checkAndPostFixedExpenses: async (userId: string, categories: Category[]) => {
    console.log('Verificando gastos fijos para registrar...');
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    const currentMonthMarker = `${currentYear}-${currentMonth}`;

    try {
      const fixedExpenses = await fixedExpenseService.getFixedExpensesOnce(userId);

      for (const fixed of fixedExpenses) {
        const hasBeenPostedThisMonth = fixed.lastPostedMonth === currentMonthMarker;
        const isDue = currentDay >= fixed.dayOfMonth;

        if (!hasBeenPostedThisMonth && isDue) {
          console.log(`Registrando gasto fijo: ${fixed.description}`);
          
          const category = categories.find(c => c.id === fixed.category);
          const subCategory = category?.subcategories.find(s => s.name === 'Gasto Fijo') || category?.subcategories[0];

          const expenseDate = new Date(currentYear, currentMonth, fixed.dayOfMonth);
          
          await expensesService.addExpense(userId, {
            description: fixed.description,
            amount: fixed.amount,
            categoryId: fixed.category,
            subCategory: subCategory?.name || 'Varios',
            createdAt: Timestamp.fromDate(expenseDate)
          }, Timestamp.fromDate(expenseDate));

          await fixedExpenseService.updateFixedExpense(userId, fixed.id, {
            lastPostedMonth: currentMonthMarker,
          });
        }
      }
    } catch (error) {
      console.error("Error en la automatización de gastos fijos:", error);
    }
  }
};