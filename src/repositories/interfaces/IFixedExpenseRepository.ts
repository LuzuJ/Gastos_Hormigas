import { IRepository } from './IRepository';
import type { FixedExpense } from '../../types';

/**
 * Interfaz de repositorio para la gestión de gastos fijos
 */
export interface IFixedExpenseRepository extends IRepository<FixedExpense, string> {
  /**
   * Obtiene los gastos fijos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de gastos fijos
   */
  getFixedExpenses(userId: string): Promise<FixedExpense[]>;
  
  /**
   * Agrega un nuevo gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseData - Datos del gasto fijo a agregar
   * @returns Una promesa que resuelve al gasto fijo creado
   */
  addFixedExpense(userId: string, fixedExpenseData: Omit<FixedExpense, 'id'>): Promise<FixedExpense>;
  
  /**
   * Actualiza un gasto fijo existente
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo a actualizar
   * @param partialData - Datos parciales para actualizar el gasto fijo
   * @returns Una promesa que resuelve al gasto fijo actualizado
   */
  updateFixedExpense(userId: string, fixedExpenseId: string, partialData: Partial<FixedExpense>): Promise<FixedExpense>;
  
  /**
   * Elimina un gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteFixedExpense(userId: string, fixedExpenseId: string): Promise<boolean>;
  
  /**
   * Actualiza el último mes registrado para un gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo
   * @param month - Mes a registrar (formato YYYY-MM)
   * @returns Una promesa que resuelve a true si la actualización fue exitosa
   */
  updateLastPostedMonth(userId: string, fixedExpenseId: string, month: string): Promise<boolean>;
  
  /**
   * Suscribe a cambios en los gastos fijos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToFixedExpenses(userId: string, callback: (fixedExpenses: FixedExpense[]) => void): () => void;
}
