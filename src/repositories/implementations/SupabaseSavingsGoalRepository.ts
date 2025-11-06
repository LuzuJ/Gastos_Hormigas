import { SupabaseRepository } from './SupabaseRepository';
import type { ISavingsGoalRepository } from '../interfaces';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Tipo para metas de ahorro en la base de datos de Supabase
 * Alineado con el esquema real de la tabla savings_goals
 */
interface SupabaseSavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Implementación del repositorio de metas de ahorro para Supabase
 */
export class SupabaseSavingsGoalRepository 
  extends SupabaseRepository<SavingsGoal, string, SavingsGoalFormData> 
  implements ISavingsGoalRepository {
  
  private readonly subscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor() {
    super(SUPABASE_TABLES.SAVINGS_GOALS);
  }
  
  /**
   * Obtiene las metas de ahorro de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de metas de ahorro
   */
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    return this.getAll(userId);
  }
  
  /**
   * Agrega una nueva meta de ahorro
   * @param userId - ID del usuario
   * @param goalData - Datos de la meta de ahorro a agregar
   * @returns Una promesa que resuelve a la meta de ahorro creada
   */
  async addSavingsGoal(userId: string, goalData: SavingsGoalFormData): Promise<SavingsGoal> {
    // Agregar el monto actual inicializado en 0
    const completeData = {
      ...goalData,
      currentAmount: 0
    };
    
    return this.create(userId, completeData as SavingsGoalFormData);
  }
  
  /**
   * Actualiza una meta de ahorro existente
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro a actualizar
   * @param partialData - Datos parciales para actualizar la meta de ahorro
   * @returns Una promesa que resuelve a la meta de ahorro actualizada
   */
  async updateSavingsGoal(
    userId: string, 
    goalId: string, 
    partialData: Partial<SavingsGoal>
  ): Promise<SavingsGoal> {
    return this.update(userId, goalId, partialData);
  }
  
  /**
   * Elimina una meta de ahorro
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async deleteSavingsGoal(userId: string, goalId: string): Promise<boolean> {
    return this.delete(userId, goalId);
  }
  
  /**
   * Actualiza el monto actual de una meta de ahorro
   * @param userId - ID del usuario
   * @param goalId - ID de la meta de ahorro
   * @param amount - Monto a agregar (o restar si es negativo) al monto actual
   * @returns Una promesa que resuelve a la meta de ahorro actualizada
   */
  async updateSavingsGoalAmount(userId: string, goalId: string, amount: number): Promise<SavingsGoal> {
    try {
      // Primero obtenemos la meta de ahorro actual
      const goal = await this.getById(goalId);
      if (!goal) {
        throw new Error(`Meta de ahorro con ID ${goalId} no encontrada`);
      }
      
      // Calculamos el nuevo monto
      const newAmount = goal.currentAmount + amount;
      
      // Actualizamos solo el campo currentAmount
      return await this.updateSavingsGoal(userId, goalId, { currentAmount: newAmount });
    } catch (error) {
      console.error('Error al actualizar monto de meta de ahorro:', error);
      throw error;
    }
  }
  
  /**
   * Suscribe a cambios en las metas de ahorro del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToSavingsGoals(
    userId: string, 
    callback: (savingsGoals: SavingsGoal[]) => void
  ): () => void {
    // Cancelar suscripción previa si existe
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId)?.unsubscribe();
    }
    
    // Crear una nueva suscripción
    const channel = this.client
      .channel(`${SUPABASE_TABLES.SAVINGS_GOALS}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.SAVINGS_GOALS,
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Al recibir cambios, obtener los datos actualizados
          const savingsGoals = await this.getSavingsGoals(userId);
          callback(savingsGoals);
        }
      )
      .subscribe();
    
    // Guardar la referencia del canal para poder cancelarlo después
    this.subscriptions.set(userId, channel);
    
    // También disparar una carga inicial de datos
    this.getSavingsGoals(userId).then(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
      this.subscriptions.delete(userId);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabaseSavingsGoal)
   * @returns El modelo de dominio (SavingsGoal)
   */
  protected mapDatabaseToModel(data: SupabaseSavingsGoal): SavingsGoal {
    return {
      id: data.id,
      name: data.name,
      targetAmount: data.target_amount,
      currentAmount: data.current_amount,
      targetDate: data.target_date,
      icon: data.icon,
      color: data.color,
      isActive: data.is_active,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (SavingsGoal)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<SavingsGoal>): Partial<SupabaseSavingsGoal> {
    const databaseData: Partial<SupabaseSavingsGoal> = {};
    
    if (data.name !== undefined) {
      databaseData.name = data.name;
    }
    if (data.targetAmount !== undefined) {
      databaseData.target_amount = data.targetAmount;
    }
    if (data.currentAmount !== undefined) {
      databaseData.current_amount = data.currentAmount;
    }
    if (data.targetDate !== undefined) {
      databaseData.target_date = data.targetDate;
    }
    if (data.icon !== undefined) {
      databaseData.icon = data.icon;
    }
    if (data.color !== undefined) {
      databaseData.color = data.color;
    }
    if (data.isActive !== undefined) {
      databaseData.is_active = data.isActive;
    }
    
    return databaseData;
  }
}
