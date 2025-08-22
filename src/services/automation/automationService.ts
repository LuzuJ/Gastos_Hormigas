import { fixedExpenseService } from '../expenses/fixedExpenseService';
import { expensesService } from '../expenses/expensesService';
import { Timestamp } from 'firebase/firestore';
import type { Category } from '../../types';

// Tipo para el callback de limpieza de notificaciones
type ClearNotificationCallback = (fixedExpenseId: string) => void;

export const automationService = {
  // Callback para limpiar notificaciones - se establece desde el hook
  clearNotificationCallback: null as ClearNotificationCallback | null,

  // Método para establecer el callback
  setClearNotificationCallback: (callback: ClearNotificationCallback | null) => {
    automationService.clearNotificationCallback = callback;
  },

  checkAndPostFixedExpenses: async (userId: string, categories: Category[]) => {
    try {
      // Obtener gastos fijos del usuario
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth(); // 0-11
      const currentYear = today.getFullYear();
      const currentMonthMarker = `${currentYear}-${currentMonth}`;

      const fixedExpenses = await fixedExpenseService.getFixedExpensesOnce(userId);

      for (const fixed of fixedExpenses) {
        const hasBeenPostedThisMonth = fixed.lastPostedMonth === currentMonthMarker;
        const isDue = currentDay >= fixed.dayOfMonth;

        if (!hasBeenPostedThisMonth && isDue) {
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

          // Limpiar notificaciones relacionadas con este gasto fijo
          if (automationService.clearNotificationCallback) {
            automationService.clearNotificationCallback(fixed.id);
          }
        }
      }
    } catch (error) {
      console.error("Error en la automatización de gastos fijos:", error);
    }
  }
};