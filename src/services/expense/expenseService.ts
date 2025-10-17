import { repositoryFactory } from '../../repositories';
import type { Expense, ExpenseFormData } from '../../types';

/**
 * Servicio para la gestión de gastos
 * Proporciona métodos para manipular los gastos del usuario
 */
export const expenseService = {
  /**
   * Obtiene todos los gastos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de gastos
   */
  getExpenses: async (userId: string): Promise<Expense[]> => {
    const expenseRepository = repositoryFactory.getExpenseRepository();
    return await expenseRepository.getExpenses(userId);
  },
  
  /**
   * Agrega un nuevo gasto
   * @param userId - ID del usuario
   * @param expenseData - Datos del gasto a agregar
   * @returns Una promesa que resuelve al gasto creado
   */
  addExpense: async (userId: string, expenseData: ExpenseFormData): Promise<Expense> => {
    const expenseRepository = repositoryFactory.getExpenseRepository();
    return await expenseRepository.addExpense(userId, expenseData);
  },
  
  /**
   * Actualiza un gasto existente
   * @param userId - ID del usuario
   * @param expenseId - ID del gasto a actualizar
   * @param partialData - Datos parciales para actualizar el gasto
   * @returns Una promesa que resuelve al gasto actualizado
   */
  updateExpense: async (userId: string, expenseId: string, partialData: Partial<ExpenseFormData>): Promise<Expense> => {
    const expenseRepository = repositoryFactory.getExpenseRepository();
    return await expenseRepository.updateExpense(userId, expenseId, partialData);
  },
  
  /**
   * Elimina un gasto
   * @param userId - ID del usuario
   * @param expenseId - ID del gasto a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteExpense: async (userId: string, expenseId: string): Promise<boolean> => {
    const expenseRepository = repositoryFactory.getExpenseRepository();
    return await expenseRepository.deleteExpense(userId, expenseId);
  },
  
  /**
   * Suscribe a cambios en los gastos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToExpenses: (userId: string, callback: (expenses: Expense[]) => void): (() => void) => {
    const expenseRepository = repositoryFactory.getExpenseRepository();
    return expenseRepository.subscribeToExpenses(userId, callback);
  }
};
