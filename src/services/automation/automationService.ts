import { fixedExpenseServiceRepo } from '../expenses/fixedExpenseServiceRepo';
import { expenseServiceRepo } from '../expense/expenseServiceRepo';
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
      const fixedExpenses = await fixedExpenseServiceRepo.getFixedExpenses(userId);

      for (const fixedExpense of fixedExpenses) {
        const shouldPost = await automationService.shouldPostFixedExpense(userId, fixedExpense.id, today);
        
        if (shouldPost) {
          // Encontrar la categoría correspondiente
          const category = categories.find(cat => cat.name === fixedExpense.category);
          
          if (category) {
            // Crear el gasto automáticamente
            await expenseServiceRepo.addExpense(userId, {
              amount: fixedExpense.amount,
              description: `${fixedExpense.description} (Automático)`,
              categoryId: category.id,
              subCategory: '',
              createdAt: new Date().toISOString(),
              paymentSourceId: ''
            });

            // Limpiar notificación si existe
            if (automationService.clearNotificationCallback) {
              automationService.clearNotificationCallback(fixedExpense.id);
            }

            console.log(`Gasto fijo automático creado: ${fixedExpense.description}`);
          }
        }
      }
    } catch (error) {
      console.error('Error al procesar gastos fijos automáticos:', error);
    }
  },

  shouldPostFixedExpense: async (userId: string, fixedExpenseId: string, referenceDate: Date): Promise<boolean> => {
    try {
      // Obtener gastos del mes actual para verificar si ya se registró este gasto fijo
      const expenses = await expenseServiceRepo.getExpenses(userId);
      
      // Obtener el primer y último día del mes de referencia
      const firstDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
      const lastDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);

      // Buscar si ya existe un gasto automático de este gasto fijo en el mes
      const existingExpense = expenses.find(expense => {
        if (!expense.createdAt) return false;
        const expenseDate = new Date(expense.createdAt);
        return (
          expense.description.includes('(Automático)') &&
          expenseDate >= firstDayOfMonth &&
          expenseDate <= lastDayOfMonth
        );
      });

      return !existingExpense;
    } catch (error) {
      console.error('Error al verificar si se debe crear gasto fijo:', error);
      return false;
    }
  }
};