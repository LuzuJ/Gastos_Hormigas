import { repositoryFactory } from '../../repositories';
import type { UserStats } from '../../repositories/interfaces';

/**
 * Servicio para la gestión de estadísticas de usuario utilizando el patrón repositorio
 */
export const userStatsServiceRepo = {
  /**
   * Obtiene las estadísticas de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a las estadísticas del usuario o null si no existen
   */
  getUserStats: async (userId: string): Promise<UserStats | null> => {
    const userStatsRepository = repositoryFactory.getUserStatsRepository();
    return await userStatsRepository.getUserStats(userId);
  },
  
  /**
   * Actualiza las estadísticas de un usuario
   * @param userId - ID del usuario
   * @param statsData - Datos parciales de las estadísticas a actualizar
   * @returns Una promesa que resuelve a las estadísticas actualizadas
   */
  updateUserStats: async (userId: string, statsData: Partial<UserStats>): Promise<UserStats> => {
    const userStatsRepository = repositoryFactory.getUserStatsRepository();
    return await userStatsRepository.updateUserStats(userId, statsData);
  },
  
  /**
   * Incrementa un contador específico en las estadísticas de un usuario
   * @param userId - ID del usuario
   * @param field - Campo a incrementar
   * @param value - Valor a sumar (por defecto 1)
   * @returns Una promesa que resuelve a las estadísticas actualizadas
   */
  incrementStat: async (userId: string, field: keyof UserStats, value: number = 1): Promise<UserStats> => {
    const userStatsRepository = repositoryFactory.getUserStatsRepository();
    return await userStatsRepository.incrementStat(userId, field, value);
  }
};
