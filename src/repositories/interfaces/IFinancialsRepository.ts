import { IRepository } from './IRepository';
import type { Financials } from '../../types';

/**
 * Interfaz de repositorio para la gestión de información financiera
 */
export interface IFinancialsRepository extends IRepository<Financials, string> {
  /**
   * Obtiene la información financiera de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a la información financiera del usuario o null si no existe
   */
  getFinancials(userId: string): Promise<Financials | null>;
  
  /**
   * Actualiza o crea la información financiera de un usuario
   * @param userId - ID del usuario
   * @param financialsData - Datos financieros a actualizar
   * @returns Una promesa que resuelve a la información financiera actualizada
   */
  updateFinancials(userId: string, financialsData: Partial<Financials>): Promise<Financials>;
  
  /**
   * Suscribe a cambios en la información financiera del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToFinancials(userId: string, callback: (financials: Financials | null) => void): () => void;
}
