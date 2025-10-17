import { SupabaseRepository } from './SupabaseRepository';
import type { IUserStatsRepository, UserStats } from '../interfaces';
import { SUPABASE_TABLES } from '../../constants';

/**
 * Tipo para las estadísticas de usuario en la base de datos de Supabase
 */
interface SupabaseUserStats {
  id: string;
  user_id: string;
  total_expenses?: number;
  total_savings?: number;
  last_activity_date?: string;
  streak_days?: number;
  categories_used?: number;
  // ... otros campos
}

/**
 * Implementación del repositorio de estadísticas de usuario para Supabase
 */
export class SupabaseUserStatsRepository extends SupabaseRepository<UserStats, string> implements IUserStatsRepository {
  
  constructor() {
    super(SUPABASE_TABLES.USER_STATS);
  }
  
  /**
   * Obtiene las estadísticas de un usuario por su ID
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a las estadísticas del usuario o null si no existen
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_TABLES.USER_STATS)
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }
      
      return this.mapDatabaseToModel(data);
    } catch (error) {
      console.error('Error al obtener estadísticas del usuario:', error);
      return null;
    }
  }
  
  /**
   * Actualiza las estadísticas de un usuario
   * @param userId - ID del usuario
   * @param statsData - Datos parciales de las estadísticas a actualizar
   * @returns Una promesa que resuelve a las estadísticas actualizadas
   */
  async updateUserStats(userId: string, statsData: Partial<UserStats>): Promise<UserStats> {
    return this.update(userId, userId, statsData);
  }
  
  /**
   * Incrementa un contador específico en las estadísticas de un usuario
   * @param userId - ID del usuario
   * @param field - Campo a incrementar
   * @param value - Valor a sumar (por defecto 1)
   * @returns Una promesa que resuelve a las estadísticas actualizadas
   */
  async incrementStat(userId: string, field: keyof UserStats, value: number = 1): Promise<UserStats> {
    try {
      // Convertir el nombre del campo del modelo al formato de la base de datos
      const dbField = this.getDbFieldName(field);
      if (!dbField) {
        throw new Error(`Campo desconocido: ${field}`);
      }
      
      // Usar la función de incremento de Supabase
      const { error } = await this.client.rpc('increment_user_stat', { 
        p_user_id: userId,
        p_field: dbField,
        p_value: value
      });
      
      if (error) throw error;
      
      // Obtener las estadísticas actualizadas
      return await this.getUserStats(userId) as UserStats;
    } catch (error) {
      console.error(`Error al incrementar estadística ${field}:`, error);
      throw error;
    }
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabaseUserStats)
   * @returns El modelo de dominio (UserStats)
   */
  protected mapDatabaseToModel(data: SupabaseUserStats): UserStats {
    return {
      id: data.id,
      userId: data.user_id,
      totalExpenses: data.total_expenses,
      totalSavings: data.total_savings,
      lastActivityDate: data.last_activity_date,
      streakDays: data.streak_days,
      categoriesUsed: data.categories_used,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (UserStats)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<UserStats>): Partial<SupabaseUserStats> {
    const databaseData: Partial<SupabaseUserStats> = {};
    
    if (data.userId !== undefined) {
      databaseData.user_id = data.userId;
    }
    if (data.totalExpenses !== undefined) {
      databaseData.total_expenses = data.totalExpenses;
    }
    if (data.totalSavings !== undefined) {
      databaseData.total_savings = data.totalSavings;
    }
    if (data.lastActivityDate !== undefined) {
      databaseData.last_activity_date = data.lastActivityDate;
    }
    if (data.streakDays !== undefined) {
      databaseData.streak_days = data.streakDays;
    }
    if (data.categoriesUsed !== undefined) {
      databaseData.categories_used = data.categoriesUsed;
    }
    
    return databaseData;
  }
  
  /**
   * Convierte un nombre de campo del modelo de dominio al formato de la base de datos
   * @param field - Nombre del campo en el modelo de dominio
   * @returns Nombre del campo en la base de datos
   */
  private getDbFieldName(field: keyof UserStats): string | null {
    const fieldMap: Record<string, string> = {
      'totalExpenses': 'total_expenses',
      'totalSavings': 'total_savings',
      'lastActivityDate': 'last_activity_date',
      'streakDays': 'streak_days',
      'categoriesUsed': 'categories_used',
    };
    
    return fieldMap[field] || null;
  }
}
