import { repositoryFactory } from '../../repositories';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

/**
 * Servicio para la gestión de metas de ahorro utilizando el patrón repositorio
 */
export const savingsGoalServiceRepo = {
  /**
   * Obtiene las metas de ahorro de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de metas de ahorro
   */
  getSavingsGoals: async (userId: string): Promise<SavingsGoal[]> => {
    const savingsGoalRepository = repositoryFactory.getSavingsGoalRepository();
    return await savingsGoalRepository.getSavingsGoals(userId);
  },
  
  /**
   * Agrega una nueva meta de ahorro
   * @param userId - ID del usuario
   * @param goalData - Datos de la meta de ahorro a agregar
   * @returns Una promesa que resuelve a la meta de ahorro creada
   */
  addSavingsGoal: async (userId: string, goalData: SavingsGoalFormData): Promise<SavingsGoal> => {
    const savingsGoalRepository = repositoryFactory.getSavingsGoalRepository();
    return await savingsGoalRepository.addSavingsGoal(userId, goalData);
  },
  
  /**
   * Actualiza una meta de ahorro existente
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro a actualizar
   * @param partialData - Datos parciales para actualizar la meta de ahorro
   * @returns Una promesa que resuelve a la meta de ahorro actualizada
   */
  updateSavingsGoal: async (
    userId: string, 
    goalId: string, 
    partialData: Partial<SavingsGoal>
  ): Promise<SavingsGoal> => {
    const savingsGoalRepository = repositoryFactory.getSavingsGoalRepository();
    return await savingsGoalRepository.updateSavingsGoal(userId, goalId, partialData);
  },
  
  /**
   * Elimina una meta de ahorro
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteSavingsGoal: async (userId: string, goalId: string): Promise<boolean> => {
    const savingsGoalRepository = repositoryFactory.getSavingsGoalRepository();
    return await savingsGoalRepository.deleteSavingsGoal(userId, goalId);
  },
  
  /**
   * Actualiza el monto actual de una meta de ahorro
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro
   * @param amount - Monto a agregar (o restar si es negativo) al monto actual
   * @returns Una promesa que resuelve a la meta de ahorro actualizada
   */
  updateSavingsGoalAmount: async (
    userId: string, 
    goalId: string, 
    amount: number
  ): Promise<SavingsGoal> => {
    const savingsGoalRepository = repositoryFactory.getSavingsGoalRepository();
    return await savingsGoalRepository.updateSavingsGoalAmount(userId, goalId, amount);
  },
  
  /**
   * Suscribe a cambios en las metas de ahorro del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  onSavingsGoalsUpdate: (
    userId: string, 
    callback: (savingsGoals: SavingsGoal[]) => void
  ): (() => void) => {
    const savingsGoalRepository = repositoryFactory.getSavingsGoalRepository();
    return savingsGoalRepository.subscribeToSavingsGoals(userId, callback);
  }
};
