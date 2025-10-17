import { IRepository } from './IRepository';
import type { Asset, AssetFormData } from '../../types';

/**
 * Interfaz de repositorio para la gestión de activos
 */
export interface IAssetRepository extends IRepository<Asset, string, AssetFormData> {
  /**
   * Obtiene los activos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de activos
   */
  getAssets(userId: string): Promise<Asset[]>;
  
  /**
   * Agrega un nuevo activo
   * @param userId - ID del usuario
   * @param assetData - Datos del activo a agregar
   * @returns Una promesa que resuelve al activo creado
   */
  addAsset(userId: string, assetData: AssetFormData): Promise<Asset>;
  
  /**
   * Actualiza un activo existente
   * @param userId - ID del usuario
   * @param assetId - ID del activo a actualizar
   * @param partialData - Datos parciales para actualizar el activo
   * @returns Una promesa que resuelve al activo actualizado
   */
  updateAsset(userId: string, assetId: string, partialData: Partial<Asset>): Promise<Asset>;
  
  /**
   * Elimina un activo
   * @param userId - ID del usuario
   * @param assetId - ID del activo a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteAsset(userId: string, assetId: string): Promise<boolean>;
  
  /**
   * Actualiza el valor de un activo
   * @param userId - ID del usuario
   * @param assetId - ID del activo
   * @param newValue - Nuevo valor del activo
   * @returns Una promesa que resuelve al activo actualizado
   */
  updateAssetValue(userId: string, assetId: string, newValue: number): Promise<Asset>;
  
  /**
   * Suscribe a cambios en los activos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToAssets(userId: string, callback: (assets: Asset[]) => void): () => void;
}
