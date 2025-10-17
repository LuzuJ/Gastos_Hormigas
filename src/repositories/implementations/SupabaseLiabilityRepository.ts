import { SupabaseRepository } from './SupabaseRepository';
import type { ILiabilityRepository } from '../interfaces';
import type { Liability, LiabilityFormData } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { toDate, toSupabaseTimestamp } from '../../utils/dateUtils';

/**
 * Tipo para pasivos en la base de datos de Supabase
 */
interface SupabaseLiability {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  original_amount?: number;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  interest_rate?: number;
  monthly_payment?: number;
  duration?: number;
  due_date?: string;
  description?: string;
  last_updated?: string;
  is_archived?: boolean;
  archived_at?: string;
}

/**
 * Implementación del repositorio de pasivos para Supabase
 */
export class SupabaseLiabilityRepository 
  extends SupabaseRepository<Liability, string, LiabilityFormData> 
  implements ILiabilityRepository {
  
  private readonly subscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor() {
    super(SUPABASE_TABLES.LIABILITIES);
  }
  
  /**
   * Obtiene los pasivos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de pasivos
   */
  async getLiabilities(userId: string): Promise<Liability[]> {
    return this.getAll(userId);
  }
  
  /**
   * Agrega un nuevo pasivo
   * @param userId - ID del usuario
   * @param liabilityData - Datos del pasivo a agregar
   * @returns Una promesa que resuelve al pasivo creado
   */
  async addLiability(userId: string, liabilityData: LiabilityFormData): Promise<Liability> {
    const liabilityWithTimestamp = {
      ...liabilityData,
      lastUpdated: toDate(new Date()).toISOString()
    };
    
    return this.create(userId, liabilityWithTimestamp as LiabilityFormData);
  }
  
  /**
   * Actualiza un pasivo existente
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo a actualizar
   * @param partialData - Datos parciales para actualizar el pasivo
   * @returns Una promesa que resuelve al pasivo actualizado
   */
  async updateLiability(
    userId: string, 
    liabilityId: string, 
    partialData: Partial<Liability>
  ): Promise<Liability> {
    // Agregar la fecha de actualización
    const dataWithTimestamp = {
      ...partialData,
      lastUpdated: toDate(partialData.lastUpdated || new Date()).toISOString()
    };
    
    // Si hay campo archivedAt y es un timestamp de Firebase, lo convertimos
    if (dataWithTimestamp.archivedAt) {
      dataWithTimestamp.archivedAt = toDate(dataWithTimestamp.archivedAt).toISOString();
    }
    
    return this.update(userId, liabilityId, dataWithTimestamp);
  }
  
  /**
   * Elimina un pasivo
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async deleteLiability(userId: string, liabilityId: string): Promise<boolean> {
    return this.delete(userId, liabilityId);
  }
  
  /**
   * Actualiza el monto de un pasivo
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo
   * @param newAmount - Nuevo monto del pasivo
   * @returns Una promesa que resuelve al pasivo actualizado
   */
  async updateLiabilityAmount(
    userId: string, 
    liabilityId: string, 
    newAmount: number
  ): Promise<Liability> {
    return this.updateLiability(userId, liabilityId, { amount: newAmount });
  }
  
  /**
   * Actualiza el pago mensual de un pasivo
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo
   * @param monthlyPayment - Nuevo pago mensual
   * @returns Una promesa que resuelve al pasivo actualizado
   */
  async updateLiabilityMinPayment(
    userId: string, 
    liabilityId: string, 
    monthlyPayment: number
  ): Promise<Liability> {
    return this.updateLiability(userId, liabilityId, { monthlyPayment });
  }
  
  /**
   * Archiva un pasivo (marcar como pagado o inactivo)
   * @param userId - ID del usuario
   * @param liabilityId - ID del pasivo
   * @returns Una promesa que resuelve al pasivo archivado
   */
  async archiveLiability(userId: string, liabilityId: string): Promise<Liability> {
    return this.updateLiability(userId, liabilityId, { 
      isArchived: true, 
      archivedAt: toDate(new Date()).toISOString()
    });
  }
  
  /**
   * Suscribe a cambios en los pasivos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToLiabilities(
    userId: string, 
    callback: (liabilities: Liability[]) => void
  ): () => void {
    // Cancelar suscripción previa si existe
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId)?.unsubscribe();
    }
    
    // Crear una nueva suscripción
    const channel = this.client
      .channel(`${SUPABASE_TABLES.LIABILITIES}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.LIABILITIES,
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Al recibir cambios, obtener los datos actualizados
          const liabilities = await this.getLiabilities(userId);
          callback(liabilities);
        }
      )
      .subscribe();
    
    // Guardar la referencia del canal para poder cancelarlo después
    this.subscriptions.set(userId, channel);
    
    // También disparar una carga inicial de datos
    this.getLiabilities(userId).then(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
      this.subscriptions.delete(userId);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabaseLiability)
   * @returns El modelo de dominio (Liability)
   */
  protected mapDatabaseToModel(data: SupabaseLiability): Liability {
    return {
      id: data.id,
      name: data.name,
      amount: data.amount,
      originalAmount: data.original_amount,
      type: data.type,
      interestRate: data.interest_rate,
      monthlyPayment: data.monthly_payment,
      duration: data.duration,
      dueDate: data.due_date,
      description: data.description,
      lastUpdated: data.last_updated,
      isArchived: data.is_archived,
      archivedAt: data.archived_at,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (Liability)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<Liability>): Partial<SupabaseLiability> {
    const databaseData: Partial<SupabaseLiability> = {};
    
    if (data.name !== undefined) {
      databaseData.name = data.name;
    }
    if (data.amount !== undefined) {
      databaseData.amount = data.amount;
    }
    if (data.originalAmount !== undefined) {
      databaseData.original_amount = data.originalAmount;
    }
    if (data.type !== undefined) {
      databaseData.type = data.type;
    }
    if (data.interestRate !== undefined) {
      databaseData.interest_rate = data.interestRate;
    }
    if (data.monthlyPayment !== undefined) {
      databaseData.monthly_payment = data.monthlyPayment;
    }
    if (data.duration !== undefined) {
      databaseData.duration = data.duration;
    }
    if (data.dueDate !== undefined) {
      databaseData.due_date = data.dueDate;
    }
    if (data.description !== undefined) {
      databaseData.description = data.description;
    }
    if (data.lastUpdated !== undefined) {
      databaseData.last_updated = data.lastUpdated;
    }
    if (data.isArchived !== undefined) {
      databaseData.is_archived = data.isArchived;
    }
    if (data.archivedAt !== undefined) {
      databaseData.archived_at = data.archivedAt;
    }
    
    return databaseData;
  }
}
