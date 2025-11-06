import { IRepository } from './IRepository';

/**
 * Tipo para las estadísticas del usuario
 * Alineado con el esquema de la base de datos user_stats
 */
export interface UserStats {
  id: string;
  userId: string;
  totalExpenses?: number;
  totalIncome?: number;
  totalSavings?: number;
  budgetStreak?: number;
  achievementsPoints?: number;
}

/**
 * Interfaz de repositorio para la gestión de estadísticas de usuario
 */
export interface IUserStatsRepository extends IRepository<UserStats, string> {
  /**
   * Obtiene las estadísticas de un usuario por su ID
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a las estadísticas del usuario o null si no existen
   */
  getUserStats(userId: string): Promise<UserStats | null>;
  
  /**
   * Actualiza las estadísticas de un usuario
   * @param userId - ID del usuario
   * @param statsData - Datos parciales de las estadísticas a actualizar
   * @returns Una promesa que resuelve a las estadísticas actualizadas
   */
  updateUserStats(userId: string, statsData: Partial<UserStats>): Promise<UserStats>;
  
  /**
   * Incrementa un contador específico en las estadísticas de un usuario
   * @param userId - ID del usuario
   * @param field - Campo a incrementar
   * @param value - Valor a sumar (por defecto 1)
   * @returns Una promesa que resuelve a las estadísticas actualizadas
   */
  incrementStat(userId: string, field: keyof UserStats, value?: number): Promise<UserStats>;
}
