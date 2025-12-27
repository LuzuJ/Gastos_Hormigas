import { SupabaseRepository } from './SupabaseRepository';
import type { IIncomeRepository } from '../interfaces/IIncomeRepository';
import type { Income } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Tipo para ingresos en la base de datos de Supabase
 */
interface SupabaseIncome {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: 'salary' | 'freelance' | 'investment' | 'gift' | 'other';
  asset_id?: string;
  asset_name?: string;
  income_date: string;
  is_recurring: boolean;
  recurrence_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  recurrence_day?: number;
  next_recurrence_date?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Implementación del repositorio de ingresos para Supabase
 */
export class SupabaseIncomeRepository
  extends SupabaseRepository<Income, string>
  implements IIncomeRepository {

  private readonly subscriptions: Map<string, RealtimeChannel> = new Map();

  constructor() {
    super(SUPABASE_TABLES.INCOMES);
  }

  /**
   * Obtiene ingresos por rango de fechas
   */
  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Income[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(item => this.mapDatabaseToModel(item));
    } catch (error) {
      console.error(`Error al obtener ingresos por fecha:`, error);
      throw error;
    }
  }

  /**
   * Obtiene ingresos recurrentes activos
   */
  async getRecurring(userId: string): Promise<Income[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring', true)
        .order('next_recurrence_date', { ascending: true });

      if (error) throw error;

      return data.map(item => this.mapDatabaseToModel(item));
    } catch (error) {
      console.error(`Error al obtener ingresos recurrentes:`, error);
      throw error;
    }
  }

  /**
   * Suscribe a cambios en los ingresos
   */
  subscribe(userId: string, callback: (incomes: Income[]) => void): () => void {
    // Cancelar suscripción previa si existe
    const existingSubscription = this.subscriptions.get(userId);
    if (existingSubscription) {
      this.client.removeChannel(existingSubscription);
      this.subscriptions.delete(userId);
    }

    // Crear nueva suscripción
    const channel = this.client
      .channel(`incomes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Cuando hay cambios, obtener todos los ingresos actualizados
          const incomes = await this.getAll(userId);
          callback(incomes);
        }
      )
      .subscribe();

    this.subscriptions.set(userId, channel);

    // Retornar función para cancelar suscripción
    return () => {
      this.client.removeChannel(channel);
      this.subscriptions.delete(userId);
    };
  }

  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   */
  protected mapDatabaseToModel(data: SupabaseIncome): Income {
    return {
      id: data.id,
      amount: data.amount,
      description: data.description,
      category: data.category,
      assetId: data.asset_id,
      assetName: data.asset_name,
      date: data.income_date,
      isRecurring: data.is_recurring,
      recurrenceFrequency: data.recurrence_frequency,
      recurrenceDay: data.recurrence_day,
      nextRecurrenceDate: data.next_recurrence_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   */
  protected mapModelToDatabase(data: Partial<Income> & { user_id?: string }): Partial<SupabaseIncome> {
    const databaseData: Partial<SupabaseIncome> = {};

    // Mapear user_id si está presente
    if ((data as any).user_id !== undefined) databaseData.user_id = (data as any).user_id;
    if (data.amount !== undefined) databaseData.amount = data.amount;
    if (data.description !== undefined) databaseData.description = data.description;
    if (data.category !== undefined) databaseData.category = data.category;
    if (data.assetId !== undefined) databaseData.asset_id = data.assetId;
    if (data.assetName !== undefined) databaseData.asset_name = data.assetName;
    if (data.date !== undefined) databaseData.income_date = data.date;
    if (data.isRecurring !== undefined) databaseData.is_recurring = data.isRecurring;
    if (data.recurrenceFrequency !== undefined) databaseData.recurrence_frequency = data.recurrenceFrequency;
    if (data.recurrenceDay !== undefined) databaseData.recurrence_day = data.recurrenceDay;
    if (data.nextRecurrenceDate !== undefined) databaseData.next_recurrence_date = data.nextRecurrenceDate;

    return databaseData;
  }
}
