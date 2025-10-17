import { repositoryFactory } from '../repositories';
import type { Liability, LiabilityFormData } from '../types';

/**
 * Servicio para gestionar los pasivos de un usuario
 */
export class LiabilityServiceRepo {
  /**
   * Obtiene todos los pasivos de un usuario
   * @param userId - ID del usuario
   * @returns Promise con la lista de pasivos
   */
  async getLiabilities(userId: string): Promise<Liability[]> {
    const liabilityRepository = repositoryFactory.getLiabilityRepository();
    return liabilityRepository.getLiabilities(userId);
  }
  
  /**
   * Agrega un nuevo pasivo
   * @param userId - ID del usuario
   * @param liabilityData - Datos del nuevo pasivo
   * @returns Promise con el pasivo creado
   */
  async addLiability(userId: string, liabilityData: LiabilityFormData): Promise<Liability> {
    const liabilityRepository = repositoryFactory.getLiabilityRepository();
    return liabilityRepository.addLiability(userId, liabilityData);
  }
  
  /**
   * Actualiza un pasivo existente
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo a actualizar
   * @param partialData - Datos parciales para actualizar
   * @returns Promise con el pasivo actualizado
   */
  async updateLiability(
    userId: string,
    liabilityId: string,
    partialData: Partial<Liability>
  ): Promise<Liability> {
    const liabilityRepository = repositoryFactory.getLiabilityRepository();
    return liabilityRepository.updateLiability(userId, liabilityId, partialData);
  }
  
  /**
   * Elimina un pasivo
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo a eliminar
   * @returns Promise que resuelve a true si fue eliminado con éxito
   */
  async deleteLiability(userId: string, liabilityId: string): Promise<boolean> {
    const liabilityRepository = repositoryFactory.getLiabilityRepository();
    return liabilityRepository.deleteLiability(userId, liabilityId);
  }
  
  /**
   * Actualiza el monto de un pasivo
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo
   * @param newAmount - Nuevo monto del pasivo
   * @returns Promise con el pasivo actualizado
   */
  async updateLiabilityAmount(
    userId: string, 
    liabilityId: string, 
    newAmount: number
  ): Promise<Liability> {
    const liabilityRepository = repositoryFactory.getLiabilityRepository();
    return liabilityRepository.updateLiabilityAmount(userId, liabilityId, newAmount);
  }
  
  /**
   * Archiva un pasivo (marcar como pagado o inactivo)
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo
   * @returns Promise con el pasivo archivado
   */
  async archiveLiability(userId: string, liabilityId: string): Promise<Liability> {
    const liabilityRepository = repositoryFactory.getLiabilityRepository();
    return liabilityRepository.archiveLiability(userId, liabilityId);
  }
  
  /**
   * Suscribe a cambios en los pasivos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Función para cancelar la suscripción
   */
  subscribeToLiabilities(
    userId: string, 
    callback: (liabilities: Liability[]) => void
  ): () => void {
    const liabilityRepository = repositoryFactory.getLiabilityRepository();
    return liabilityRepository.subscribeToLiabilities(userId, callback);
  }
}
