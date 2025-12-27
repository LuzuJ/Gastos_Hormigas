import { SupabaseRepository } from './SupabaseRepository';
import type { IFinancialsRepository } from '../interfaces';
import type { Financials } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Tipo para información financiera en la base de datos de Supabase
 * Alineado con el esquema real de la tabla financials
 */
interface SupabaseFinancials {
  id: string;
  user_id: string;
  monthly_income: number;
  emergency_fund: number;
  total_debt: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Implementación del repositorio de información financiera para Supabase
 */
export class SupabaseFinancialsRepository 
  extends SupabaseRepository<Financials, string> 
  implements IFinancialsRepository {
  
  private readonly subscriptions: Map<string, RealtimeChannel> = new Map();
  
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
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        return null;
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
      const { data: existing, error: fetchError } = await this.client
        .from(SUPABASE_TABLES.FINANCIALS)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error al verificar financials existentes:', fetchError);
        throw fetchError;
      }
      
      const databaseData = this.mapModelToDatabase(financialsData);

      if (existing) {
        // Si existe, actualizar usando el ID de la fila
        const { data: updatedData, error: updateError } = await this.client
          .from(SUPABASE_TABLES.FINANCIALS)
          .update(databaseData)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        return this.mapDatabaseToModel(updatedData);
      } else {
        // Si no existe, crear
        const completeData: Partial<SupabaseFinancials> = {
          user_id: userId,
          monthly_income: financialsData.monthlyIncome || 0,
          emergency_fund: financialsData.emergencyFund || 0,
          total_debt: financialsData.totalDebt || 0
        };
        
        const { data: newData, error: createError } = await this.client
          .from(SUPABASE_TABLES.FINANCIALS)
          .insert(completeData)
          .select()
          .single();
        
        if (createError) throw createError;
        
        return this.mapDatabaseToModel(newData);
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
    this.getFinancials(userId)
      .then(financials => {
        callback(financials);
      })
      .catch(error => {
        console.error(`[SupabaseFinancialsRepository] Error loading initial financials:`, error);
        callback(null);
      });
    
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
      emergencyFund: data.emergency_fund,
      totalDebt: data.total_debt,
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
    if (data.emergencyFund !== undefined) {
      databaseData.emergency_fund = data.emergencyFund;
    }
    if (data.totalDebt !== undefined) {
      databaseData.total_debt = data.totalDebt;
    }
    
    return databaseData;
  }
}
