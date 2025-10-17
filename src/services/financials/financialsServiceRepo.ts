import { repositoryFactory } from '../../repositories';
import type { Financials } from '../../types';

/**
 * Servicio para la gestión de información financiera utilizando el patrón repositorio
 */
export const financialsServiceRepo = {
  /**
   * Obtiene la información financiera de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a la información financiera del usuario o null si no existe
   */
  getFinancials: async (userId: string): Promise<Financials | null> => {
    const financialsRepository = repositoryFactory.getFinancialsRepository();
    return await financialsRepository.getFinancials(userId);
  },
  
  /**
   * Actualiza el ingreso mensual del usuario
   * @param userId - ID del usuario
   * @param income - Ingreso mensual
   * @returns Una promesa que resuelve a la información financiera actualizada
   */
  setMonthlyIncome: async (userId: string, income: number): Promise<Financials> => {
    const financialsRepository = repositoryFactory.getFinancialsRepository();
    return await financialsRepository.updateFinancials(userId, { monthlyIncome: income });
  },
  
  /**
   * Actualiza la información financiera de un usuario
   * @param userId - ID del usuario
   * @param financialsData - Datos financieros a actualizar
   * @returns Una promesa que resuelve a la información financiera actualizada
   */
  updateFinancials: async (userId: string, financialsData: Partial<Financials>): Promise<Financials> => {
    const financialsRepository = repositoryFactory.getFinancialsRepository();
    return await financialsRepository.updateFinancials(userId, financialsData);
  },
  
  /**
   * Suscribe a cambios en la información financiera del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  onFinancialsUpdate: (
    userId: string, 
    callback: (financials: Financials | null) => void
  ): (() => void) => {
    const financialsRepository = repositoryFactory.getFinancialsRepository();
    return financialsRepository.subscribeToFinancials(userId, callback);
  }
};
