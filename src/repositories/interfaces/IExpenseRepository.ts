import { IRepository } from './IRepository';
import type { Expense, ExpenseFormData } from '../../types';

/**
 * Interfaz de repositorio para la gestión de gastos
 */
export interface IExpenseRepository extends IRepository<Expense, string, ExpenseFormData> {
  /**
   * Obtiene los gastos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de gastos
   */
  getExpenses(userId: string): Promise<Expense[]>;
  
  /**
   * Agrega un nuevo gasto
   * @param userId - ID del usuario
   * @param expenseData - Datos del gasto a agregar
   * @returns Una promesa que resuelve al gasto creado
   */
  addExpense(userId: string, expenseData: ExpenseFormData): Promise<Expense>;
  
  /**
   * Actualiza un gasto existente
   * @param userId - ID del usuario
   * @param expenseId - ID del gasto a actualizar
   * @param partialData - Datos parciales para actualizar el gasto
   * @returns Una promesa que resuelve al gasto actualizado
   */
  updateExpense(userId: string, expenseId: string, partialData: Partial<ExpenseFormData>): Promise<Expense>;
  
  /**
   * Elimina un gasto
   * @param userId - ID del usuario
   * @param expenseId - ID del gasto a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteExpense(userId: string, expenseId: string): Promise<boolean>;
  
  /**
   * Suscribe a cambios en los gastos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToExpenses(userId: string, callback: (expenses: Expense[]) => void): () => void;
}
