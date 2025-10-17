import { IRepository } from './IRepository';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

/**
 * Interfaz de repositorio para la gestión de metas de ahorro
 */
export interface ISavingsGoalRepository extends IRepository<SavingsGoal, string, SavingsGoalFormData> {
  /**
   * Obtiene las metas de ahorro de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de metas de ahorro
   */
  getSavingsGoals(userId: string): Promise<SavingsGoal[]>;
  
  /**
   * Agrega una nueva meta de ahorro
   * @param userId - ID del usuario
   * @param goalData - Datos de la meta de ahorro a agregar
   * @returns Una promesa que resuelve a la meta de ahorro creada
   */
  addSavingsGoal(userId: string, goalData: SavingsGoalFormData): Promise<SavingsGoal>;
  
  /**
   * Actualiza una meta de ahorro existente
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro a actualizar
   * @param partialData - Datos parciales para actualizar la meta de ahorro
   * @returns Una promesa que resuelve a la meta de ahorro actualizada
   */
  updateSavingsGoal(userId: string, goalId: string, partialData: Partial<SavingsGoal>): Promise<SavingsGoal>;
  
  /**
   * Elimina una meta de ahorro
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteSavingsGoal(userId: string, goalId: string): Promise<boolean>;
  
  /**
   * Actualiza el monto actual de una meta de ahorro
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro
   * @param amount - Monto a agregar (o restar si es negativo) al monto actual
   * @returns Una promesa que resuelve a la meta de ahorro actualizada
   */
  updateSavingsGoalAmount(userId: string, goalId: string, amount: number): Promise<SavingsGoal>;
  
  /**
   * Suscribe a cambios en las metas de ahorro del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToSavingsGoals(userId: string, callback: (savingsGoals: SavingsGoal[]) => void): () => void;
}
