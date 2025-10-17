import { SupabaseRepository } from './SupabaseRepository';
import type { IFinancialsRepository } from '../interfaces';
import type { Financials } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Tipo para información financiera en la base de datos de Supabase
 */
interface SupabaseFinancials {
  id: string;
  user_id: string;
  monthly_income: number;
}

/**
 * Implementación del repositorio de información financiera para Supabase
 */
export class SupabaseFinancialsRepository 
  extends SupabaseRepository<Financials, string> 
  implements IFinancialsRepository {
  
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor() {
    super(SUPABASE_TABLES.FINANCIALS);
  }
  
  /**
   * Obtiene la información financiera de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a la información financiera del usuario o null si no existe
   */
  async getFinancials(userId: string): Promise<Financials | null> {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_TABLES.FINANCIALS)
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
      console.error('Error al obtener información financiera:', error);
      return null;
    }
  }
  
  /**
   * Actualiza o crea la información financiera de un usuario
   * @param userId - ID del usuario
   * @param financialsData - Datos financieros a actualizar
   * @returns Una promesa que resuelve a la información financiera actualizada
   */
  async updateFinancials(userId: string, financialsData: Partial<Financials>): Promise<Financials> {
    try {
      // Verificar si ya existe información financiera para este usuario
      const existing = await this.getFinancials(userId);
      
      if (existing) {
        // Si existe, actualizar
        return await this.update(userId, userId, financialsData);
      } else {
        // Si no existe, crear
        // Asegurarnos de que tenga al menos el campo monthlyIncome
        const completeData: Financials = {
          monthlyIncome: financialsData.monthlyIncome || 0
        };
        
        return await this.create(userId, completeData);
      }
    } catch (error) {
      console.error('Error al actualizar información financiera:', error);
      throw error;
    }
  }
  
  /**
   * Suscribe a cambios en la información financiera del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToFinancials(
    userId: string, 
    callback: (financials: Financials | null) => void
  ): () => void {
    // Cancelar suscripción previa si existe
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId)?.unsubscribe();
    }
    
    // Crear una nueva suscripción
    const channel = this.client
      .channel(`${SUPABASE_TABLES.FINANCIALS}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.FINANCIALS,
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Al recibir cambios, obtener los datos actualizados
          const financials = await this.getFinancials(userId);
          callback(financials);
        }
      )
      .subscribe();
    
    // Guardar la referencia del canal para poder cancelarlo después
    this.subscriptions.set(userId, channel);
    
    // También disparar una carga inicial de datos
    this.getFinancials(userId).then(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
      this.subscriptions.delete(userId);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabaseFinancials)
   * @returns El modelo de dominio (Financials)
   */
  protected mapDatabaseToModel(data: SupabaseFinancials): Financials {
    return {
      monthlyIncome: data.monthly_income,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (Financials)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<Financials>): Partial<SupabaseFinancials> {
    const databaseData: Partial<SupabaseFinancials> = {};
    
    if (data.monthlyIncome !== undefined) {
      databaseData.monthly_income = data.monthlyIncome;
    }
    
    return databaseData;
  }
}
