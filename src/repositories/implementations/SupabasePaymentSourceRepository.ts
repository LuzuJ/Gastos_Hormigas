import { SupabaseRepository } from './SupabaseRepository';
import type { IPaymentSourceRepository } from '../interfaces';
import type { PaymentSource, PaymentSourceType } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { toDate, toSupabaseTimestamp } from '../../utils/dateUtils';

/**
 * Tipo para fuentes de pago en la base de datos de Supabase
 */
interface SupabasePaymentSource {
  id: string;
  user_id: string;
  name: string;
  type: PaymentSourceType;
  balance?: number;
  description?: string;
  is_active: boolean;
  icon?: string;
  color?: string;
  auto_update?: boolean;
  updated_at?: string;
}

/**
 * Implementación del repositorio de fuentes de pago para Supabase
 */
export class SupabasePaymentSourceRepository 
  extends SupabaseRepository<PaymentSource, string> 
  implements IPaymentSourceRepository {
  
  private readonly subscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor() {
    super(SUPABASE_TABLES.PAYMENT_SOURCES);
  }
  
  /**
   * Obtiene las fuentes de pago de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de fuentes de pago
   */
  async getPaymentSources(userId: string): Promise<PaymentSource[]> {
    return this.getAll(userId);
  }
  
  /**
   * Agrega una nueva fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceData - Datos de la fuente de pago a agregar
   * @returns Una promesa que resuelve a la fuente de pago creada
   */
  async addPaymentSource(userId: string, paymentSourceData: Omit<PaymentSource, 'id'>): Promise<PaymentSource> {
    const paymentSourceWithTimestamp = {
      ...paymentSourceData,
      lastUpdated: toDate(paymentSourceData.lastUpdated || new Date()).toISOString()
    };
    
    return this.create(userId, paymentSourceWithTimestamp);
  }
  
  /**
   * Actualiza una fuente de pago existente
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago a actualizar
   * @param partialData - Datos parciales para actualizar la fuente de pago
   * @returns Una promesa que resuelve a la fuente de pago actualizada
   */
  async updatePaymentSource(
    userId: string, 
    paymentSourceId: string, 
    partialData: Partial<PaymentSource>
  ): Promise<PaymentSource> {
    // Agregar la fecha de actualización, convirtiendo si es necesario
    const dataWithTimestamp = {
      ...partialData,
      lastUpdated: toDate(partialData.lastUpdated || new Date()).toISOString()
    };
    
    return this.update(userId, paymentSourceId, dataWithTimestamp);
  }
  
  /**
   * Elimina una fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async deletePaymentSource(userId: string, paymentSourceId: string): Promise<boolean> {
    return this.delete(userId, paymentSourceId);
  }
  
  /**
   * Actualiza el balance de una fuente de pago
   * @param userId - ID del usuario
   * @param paymentSourceId - ID de la fuente de pago
   * @param amount - Monto a sumar (o restar si es negativo) al balance actual
   * @returns Una promesa que resuelve a la fuente de pago actualizada
   */
  async updatePaymentSourceBalance(
    userId: string, 
    paymentSourceId: string, 
    amount: number
  ): Promise<PaymentSource> {
    try {
      // Primero obtenemos la fuente de pago actual para conocer su balance
      // Usamos una consulta directa a Supabase para filtrar por usuario e ID
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', paymentSourceId)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        throw new Error(`PaymentSource con ID ${paymentSourceId} no encontrado para el usuario ${userId}`);
      }
      
      const currentPaymentSource = this.mapDatabaseToModel(data);
      
      // Calculamos el nuevo balance
      const currentBalance = currentPaymentSource.balance || 0;
      const newBalance = currentBalance + amount;
      
      // Actualizamos la fuente de pago con el nuevo balance
      return this.updatePaymentSource(userId, paymentSourceId, { balance: newBalance });
    } catch (error) {
      console.error('Error al actualizar el balance de la fuente de pago:', error);
      throw error;
    }
  }
  
  /**
   * Suscribe a cambios en las fuentes de pago del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToPaymentSources(
    userId: string, 
    callback: (paymentSources: PaymentSource[]) => void
  ): () => void {
    // Cancelar suscripción previa si existe
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId)?.unsubscribe();
    }
    
    // Crear una nueva suscripción
    const channel = this.client
      .channel(`${SUPABASE_TABLES.PAYMENT_SOURCES}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.PAYMENT_SOURCES,
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Al recibir cambios, obtener los datos actualizados
          const paymentSources = await this.getPaymentSources(userId);
          callback(paymentSources);
        }
      )
      .subscribe();
    
    // Guardar la referencia del canal para poder cancelarlo después
    this.subscriptions.set(userId, channel);
    
    // También disparar una carga inicial de datos
    this.getPaymentSources(userId).then(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
      this.subscriptions.delete(userId);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabasePaymentSource)
   * @returns El modelo de dominio (PaymentSource)
   */
  protected mapDatabaseToModel(data: SupabasePaymentSource): PaymentSource {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      balance: data.balance,
      description: data.description,
      isActive: data.is_active,
      icon: data.icon,
      color: data.color,
      autoUpdate: data.auto_update,
      lastUpdated: data.updated_at,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (PaymentSource)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<PaymentSource>): Partial<SupabasePaymentSource> {
    const databaseData: Partial<SupabasePaymentSource> = {};
    
    if (data.name !== undefined) {
      databaseData.name = data.name;
    }
    if (data.type !== undefined) {
      databaseData.type = data.type;
    }
    if (data.balance !== undefined) {
      databaseData.balance = data.balance;
    }
    if (data.description !== undefined) {
      databaseData.description = data.description;
    }
    if (data.isActive !== undefined) {
      databaseData.is_active = data.isActive;
    }
    if (data.icon !== undefined) {
      databaseData.icon = data.icon;
    }
    if (data.color !== undefined) {
      databaseData.color = data.color;
    }
    if (data.autoUpdate !== undefined) {
      databaseData.auto_update = data.autoUpdate;
    }
    if (data.lastUpdated !== undefined) {
      databaseData.updated_at = data.lastUpdated;
    }
    
    return databaseData;
  }
}
