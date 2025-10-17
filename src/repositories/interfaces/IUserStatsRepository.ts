import { IRepository } from './IRepository';

/**
 * Tipo para las estadísticas del usuario
 */
export interface UserStats {
  id: string;
  userId: string;
  // Agregar aquí los campos específicos para las estadísticas
  // Por ejemplo:
  totalExpenses?: number;
  totalSavings?: number;
  lastActivityDate?: string;
  streakDays?: number;
  categoriesUsed?: number;
  // ... otros campos relevantes
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
