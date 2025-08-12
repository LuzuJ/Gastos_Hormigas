import { fixedExpenseService } from './fixedExpenseService';
import { expensesService } from './expensesService';
import { Timestamp } from 'firebase/firestore';

export const automationService = {
  checkAndPostFixedExpenses: async (userId: string) => {
    console.log('Verificando gastos fijos...');
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    const currentMonthMarker = `${currentYear}-${currentMonth}`; // ej: "2025-7"

    try {
      const fixedExpenses = await fixedExpenseService.getFixedExpensesOnce(userId);

      for (const fixed of fixedExpenses) {
        const hasBeenPostedThisMonth = fixed.lastPostedMonth === currentMonthMarker;
        const isDue = currentDay >= fixed.dayOfMonth;

        if (!hasBeenPostedThisMonth && isDue) {
          console.log(`Registrando gasto fijo: ${fixed.description}`);

          // 1. Crea el nuevo gasto en el registro general
          const expenseDate = new Date(currentYear, currentMonth, fixed.dayOfMonth);
          await expensesService.addExpense(userId, {
            description: fixed.description,
            amount: fixed.amount,
            categoryId: fixed.category, // Asumimos que el 'category' de FixedExpense es un categoryId
            subCategory: 'Gasto Fijo', // O una subcategoría por defecto
            createdAt: Timestamp.fromDate(expenseDate) // Usamos la fecha de vencimiento
          });

          // 2. Marca el gasto fijo como registrado para este mes
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