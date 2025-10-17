import { IRepository } from './IRepository';
import type { Liability, LiabilityFormData } from '../../types';

/**
 * Interfaz de repositorio para la gestión de pasivos
 */
export interface ILiabilityRepository extends IRepository<Liability, string, LiabilityFormData> {
  /**
   * Obtiene los pasivos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de pasivos
   */
  getLiabilities(userId: string): Promise<Liability[]>;
  
  /**
   * Agrega un nuevo pasivo
   * @param userId - ID del usuario
   * @param liabilityData - Datos del pasivo a agregar
   * @returns Una promesa que resuelve al pasivo creado
   */
  addLiability(userId: string, liabilityData: LiabilityFormData): Promise<Liability>;
  
  /**
   * Actualiza un pasivo existente
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo a actualizar
   * @param partialData - Datos parciales para actualizar el pasivo
   * @returns Una promesa que resuelve al pasivo actualizado
   */
  updateLiability(userId: string, liabilityId: string, partialData: Partial<Liability>): Promise<Liability>;
  
  /**
   * Elimina un pasivo
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteLiability(userId: string, liabilityId: string): Promise<boolean>;
  
  /**
   * Actualiza el monto de un pasivo
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo
   * @param newAmount - Nuevo monto del pasivo
   * @returns Una promesa que resuelve al pasivo actualizado
   */
  updateLiabilityAmount(userId: string, liabilityId: string, newAmount: number): Promise<Liability>;
  
  /**
   * Archiva un pasivo (marcar como pagado o inactivo)
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo
   * @returns Una promesa que resuelve al pasivo archivado
   */
  archiveLiability(userId: string, liabilityId: string): Promise<Liability>;
  
  /**
   * Suscribe a cambios en los pasivos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToLiabilities(userId: string, callback: (liabilities: Liability[]) => void): () => void;
}
