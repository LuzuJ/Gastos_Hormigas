import { SupabaseRepository } from './SupabaseRepository';
import type { ILiabilityRepository } from '../interfaces';
import type { Liability, LiabilityFormData } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Tipo para pasivos en la base de datos de Supabase
 * Alineado con el esquema real de la tabla liabilities
 */
interface SupabaseLiability {
  id: string;
  user_id: string;
  name: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  amount: number;
  interest_rate?: number;
  monthly_payment?: number;
  due_date?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
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
    // No agregamos lastUpdated porque updated_at se crea automáticamente en BD
    return this.create(userId, liabilityData);
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
    // No manipulamos lastUpdated porque updated_at se actualiza automáticamente en BD
    // Tampoco procesamos archivedAt porque no existe en el esquema
    return this.update(userId, liabilityId, partialData);
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
   * @deprecated Los campos isArchived y archivedAt no existen en el esquema de BD
   */
  async archiveLiability(userId: string, liabilityId: string): Promise<Liability> {
    // Los campos isArchived y archivedAt no existen en la BD
    // Por compatibilidad, se mantiene el método pero solo devuelve el pasivo sin cambios
    console.warn('[SupabaseLiabilityRepository] archiveLiability: Campos isArchived/archivedAt no existen en la BD');
    const liability = await this.getById(liabilityId);
    if (!liability) {
      throw new Error(`Pasivo con ID ${liabilityId} no encontrado`);
    }
    return liability;
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
      type: data.type,
      interestRate: data.interest_rate,
      monthlyPayment: data.monthly_payment,
      dueDate: data.due_date,
      description: data.description,
      lastUpdated: data.updated_at, // BD usa updated_at (automático)
      // Campos que no existen en BD pero el modelo los espera:
      originalAmount: undefined,
      duration: undefined,
      isArchived: undefined,
      archivedAt: undefined,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (Liability)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<Liability> & { user_id?: string }): Partial<SupabaseLiability> {
    const databaseData: Partial<SupabaseLiability> = {};
    
    if ((data as any).user_id !== undefined) {
      databaseData.user_id = (data as any).user_id;
    }
    if (data.name !== undefined) {
      databaseData.name = data.name;
    }
    if (data.amount !== undefined) {
      databaseData.amount = data.amount;
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
    if (data.dueDate !== undefined) {
      databaseData.due_date = data.dueDate;
    }
    if (data.description !== undefined) {
      databaseData.description = data.description;
    }
    // Ignorar campos que no existen en BD:
    // - originalAmount, duration, lastUpdated, isArchived, archivedAt
    
    return databaseData;
  }
}
