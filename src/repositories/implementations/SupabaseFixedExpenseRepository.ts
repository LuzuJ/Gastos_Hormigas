import { SupabaseRepository } from './SupabaseRepository';
import type { IFixedExpenseRepository } from '../interfaces';
import type { FixedExpense } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Tipo para gastos fijos en la base de datos de Supabase
 */
interface SupabaseFixedExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  day_of_month: number;
  last_posted_month?: string;
}

/**
 * Implementación del repositorio de gastos fijos para Supabase
 */
export class SupabaseFixedExpenseRepository 
  extends SupabaseRepository<FixedExpense, string> 
  implements IFixedExpenseRepository {
  
  private subscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor() {
    super(SUPABASE_TABLES.FIXED_EXPENSES);
  }
  
  /**
   * Obtiene los gastos fijos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de gastos fijos
   */
  async getFixedExpenses(userId: string): Promise<FixedExpense[]> {
    return this.getAll(userId);
  }
  
  /**
   * Agrega un nuevo gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseData - Datos del gasto fijo a agregar
   * @returns Una promesa que resuelve al gasto fijo creado
   */
  async addFixedExpense(userId: string, fixedExpenseData: Omit<FixedExpense, 'id'>): Promise<FixedExpense> {
    return this.create(userId, fixedExpenseData);
  }
  
  /**
   * Actualiza un gasto fijo existente
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo a actualizar
   * @param partialData - Datos parciales para actualizar el gasto fijo
   * @returns Una promesa que resuelve al gasto fijo actualizado
   */
  async updateFixedExpense(
    userId: string, 
    fixedExpenseId: string, 
    partialData: Partial<FixedExpense>
  ): Promise<FixedExpense> {
    return this.update(userId, fixedExpenseId, partialData);
  }
  
  /**
   * Elimina un gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async deleteFixedExpense(userId: string, fixedExpenseId: string): Promise<boolean> {
    return this.delete(userId, fixedExpenseId);
  }
  
  /**
   * Actualiza el último mes registrado para un gasto fijo
   * @param userId - ID del usuario
   * @param fixedExpenseId - ID del gasto fijo
   * @param month - Mes a registrar (formato YYYY-MM)
   * @returns Una promesa que resuelve a true si la actualización fue exitosa
   */
  async updateLastPostedMonth(userId: string, fixedExpenseId: string, month: string): Promise<boolean> {
    try {
      await this.update(userId, fixedExpenseId, { lastPostedMonth: month });
      return true;
    } catch (error) {
      console.error('Error al actualizar el último mes registrado:', error);
      return false;
    }
  }
  
  /**
   * Suscribe a cambios en los gastos fijos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToFixedExpenses(
    userId: string, 
    callback: (fixedExpenses: FixedExpense[]) => void
  ): () => void {
    // Cancelar suscripción previa si existe
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId)?.unsubscribe();
    }
    
    // Crear una nueva suscripción
    const channel = this.client
      .channel(`${SUPABASE_TABLES.FIXED_EXPENSES}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.FIXED_EXPENSES,
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Al recibir cambios, obtener los datos actualizados
          const fixedExpenses = await this.getFixedExpenses(userId);
          callback(fixedExpenses);
        }
      )
      .subscribe();
    
    // Guardar la referencia del canal para poder cancelarlo después
    this.subscriptions.set(userId, channel);
    
    // También disparar una carga inicial de datos
    this.getFixedExpenses(userId).then(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
      this.subscriptions.delete(userId);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabaseFixedExpense)
   * @returns El modelo de dominio (FixedExpense)
   */
  protected mapDatabaseToModel(data: SupabaseFixedExpense): FixedExpense {
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      category: data.category,
      dayOfMonth: data.day_of_month,
      lastPostedMonth: data.last_posted_month,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (FixedExpense)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<FixedExpense>): Partial<SupabaseFixedExpense> {
    const databaseData: Partial<SupabaseFixedExpense> = {};
    
    if (data.description !== undefined) {
      databaseData.description = data.description;
    }
    if (data.amount !== undefined) {
      databaseData.amount = data.amount;
    }
    if (data.category !== undefined) {
      databaseData.category = data.category;
    }
    if (data.dayOfMonth !== undefined) {
      databaseData.day_of_month = data.dayOfMonth;
    }
    if (data.lastPostedMonth !== undefined) {
      databaseData.last_posted_month = data.lastPostedMonth;
    }
    
    return databaseData;
  }
}
