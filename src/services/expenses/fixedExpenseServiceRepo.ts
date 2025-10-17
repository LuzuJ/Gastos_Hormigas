import { repositoryFactory } from '../../repositories';
import type { FixedExpense } from '../../types';

/**
 * Servicio para la gestión de gastos fijos utilizando el patrón repositorio
 */
export const fixedExpenseServiceRepo = {
  /**
   * Obtiene los gastos fijos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de gastos fijos
   */
  getFixedExpenses: async (userId: string): Promise<FixedExpense[]> => {
    const fixedExpenseRepository = repositoryFactory.getFixedExpenseRepository();
    return await fixedExpenseRepository.getFixedExpenses(userId);
  },
  
  /**
   * Agrega un nuevo gasto fijo
   * @param userId - ID del usuario
   * @param data - Datos del gasto fijo a agregar
   * @returns Una promesa que resuelve al gasto fijo creado
   */
  addFixedExpense: async (userId: string, data: Omit<FixedExpense, 'id'>): Promise<FixedExpense> => {
    const fixedExpenseRepository = repositoryFactory.getFixedExpenseRepository();
    return await fixedExpenseRepository.addFixedExpense(userId, data);
  },
  
  /**
   * Actualiza un gasto fijo existente
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo a actualizar
   * @param data - Datos parciales para actualizar el gasto fijo
   * @returns Una promesa que resuelve al gasto fijo actualizado
   */
  updateFixedExpense: async (
    userId: string, 
    fixedExpenseId: string, 
    data: Partial<FixedExpense>
  ): Promise<FixedExpense> => {
    const fixedExpenseRepository = repositoryFactory.getFixedExpenseRepository();
    return await fixedExpenseRepository.updateFixedExpense(userId, fixedExpenseId, data);
  },
  
  /**
   * Elimina un gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteFixedExpense: async (userId: string, fixedExpenseId: string): Promise<boolean> => {
    const fixedExpenseRepository = repositoryFactory.getFixedExpenseRepository();
    return await fixedExpenseRepository.deleteFixedExpense(userId, fixedExpenseId);
  },
  
  /**
   * Actualiza el último mes registrado para un gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo
   * @param month - Mes a registrar (formato YYYY-MM)
   * @returns Una promesa que resuelve a true si la actualización fue exitosa
   */
  updateLastPostedMonth: async (
    userId: string, 
    fixedExpenseId: string, 
    month: string
  ): Promise<boolean> => {
    const fixedExpenseRepository = repositoryFactory.getFixedExpenseRepository();
    return await fixedExpenseRepository.updateLastPostedMonth(userId, fixedExpenseId, month);
  },
  
  /**
   * Suscribe a cambios en los gastos fijos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  onFixedExpensesUpdate: (
    userId: string, 
    callback: (fixedExpenses: FixedExpense[]) => void
  ): (() => void) => {
    const fixedExpenseRepository = repositoryFactory.getFixedExpenseRepository();
    return fixedExpenseRepository.subscribeToFixedExpenses(userId, callback);
  }
};
