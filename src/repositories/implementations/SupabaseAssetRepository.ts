import { SupabaseRepository } from './SupabaseRepository';
import type { IAssetRepository } from '../interfaces';
import type { Asset, AssetFormData } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Tipo para activos en la base de datos de Supabase
 * Alineado con el esquema real de la tabla assets
 */
interface SupabaseAsset {
  id: string;
  user_id: string;
  name: string;
  type: string;
  value: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Implementación del repositorio de activos para Supabase
 */
export class SupabaseAssetRepository 
  extends SupabaseRepository<Asset, string, AssetFormData> 
  implements IAssetRepository {
  
  private readonly subscriptions: Map<string, RealtimeChannel> = new Map();
  
  constructor() {
    super(SUPABASE_TABLES.ASSETS);
  }
  
  /**
   * Obtiene los activos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de activos
   */
  async getAssets(userId: string): Promise<Asset[]> {
    return this.getAll(userId);
  }
  
  /**
   * Agrega un nuevo activo
   * @param userId - ID del usuario
   * @param assetData - Datos del activo a agregar
   * @returns Una promesa que resuelve al activo creado
   */
  async addAsset(userId: string, assetData: AssetFormData): Promise<Asset> {
    // No agregamos lastUpdated porque updated_at se crea automáticamente en BD
    return this.create(userId, assetData);
  }
  
  /**
   * Actualiza un activo existente
   * @param userId - ID del usuario
   * @param assetId - ID del activo a actualizar
   * @param partialData - Datos parciales para actualizar el activo
   * @returns Una promesa que resuelve al activo actualizado
   */
  async updateAsset(userId: string, assetId: string, partialData: Partial<Asset>): Promise<Asset> {
    // No manipulamos lastUpdated porque updated_at se actualiza automáticamente en BD
    return this.update(userId, assetId, partialData);
  }
  
  /**
   * Elimina un activo
   * @param userId - ID del usuario
   * @param assetId - ID del activo a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async deleteAsset(userId: string, assetId: string): Promise<boolean> {
    return this.delete(userId, assetId);
  }
  
  /**
   * Actualiza el valor de un activo
   * @param userId - ID del usuario
   * @param assetId - ID del activo
   * @param newValue - Nuevo valor del activo
   * @returns Una promesa que resuelve al activo actualizado
   */
  async updateAssetValue(userId: string, assetId: string, newValue: number): Promise<Asset> {
    return this.updateAsset(userId, assetId, { value: newValue });
  }
  
  /**
   * Suscribe a cambios en los activos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToAssets(
    userId: string, 
    callback: (assets: Asset[]) => void
  ): () => void {
    // Cancelar suscripción previa si existe
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId)?.unsubscribe();
    }
    
    // Crear una nueva suscripción
    const channel = this.client
      .channel(`${SUPABASE_TABLES.ASSETS}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.ASSETS,
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Al recibir cambios, obtener los datos actualizados
          const assets = await this.getAssets(userId);
          callback(assets);
        }
      )
      .subscribe();
    
    // Guardar la referencia del canal para poder cancelarlo después
    this.subscriptions.set(userId, channel);
    
    // También disparar una carga inicial de datos
    this.getAssets(userId).then(callback);
    
    // Devolver función para cancelar la suscripción
    return () => {
      channel.unsubscribe();
      this.subscriptions.delete(userId);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabaseAsset)
   * @returns El modelo de dominio (Asset)
   */
  protected mapDatabaseToModel(data: SupabaseAsset): Asset {
    return {
      id: data.id,
      name: data.name,
      value: data.value,
      type: data.type as 'cash' | 'investment' | 'property',
      description: data.description,
      lastUpdated: data.updated_at, // BD usa updated_at (automático)
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (Asset)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<Asset> & { user_id?: string }): Partial<SupabaseAsset> {
    const databaseData: Partial<SupabaseAsset> = {};
    
    if ((data as any).user_id !== undefined) {
      databaseData.user_id = (data as any).user_id;
    }
    if (data.name !== undefined) {
      databaseData.name = data.name;
    }
    if (data.value !== undefined) {
      databaseData.value = data.value;
    }
    if (data.type !== undefined) {
      databaseData.type = data.type;
    }
    if (data.description !== undefined) {
      databaseData.description = data.description;
    }
    // No mapeamos lastUpdated porque updated_at se actualiza automáticamente en BD
    
    return databaseData;
  }
}
