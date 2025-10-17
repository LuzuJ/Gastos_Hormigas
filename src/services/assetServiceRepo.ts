import { repositoryFactory } from '../repositories';
import type { IAssetRepository } from '../repositories/interfaces';
import type { Asset, AssetFormData } from '../types';

/**
 * Servicio para gestionar los activos de un usuario
 */
export class AssetServiceRepo {
  private readonly assetRepo: IAssetRepository;
  
  /**
   * Constructor del servicio de activos
   */
  constructor() {
    this.assetRepo = repositoryFactory.getAssetRepository();
  }
  
  /**
   * Obtiene todos los activos de un usuario
   * @param userId - ID del usuario
   * @returns Promise con la lista de activos
   */
  async getAssets(userId: string): Promise<Asset[]> {
    return this.assetRepo.getAssets(userId);
  }
  
  /**
   * Agrega un nuevo activo
   * @param userId - ID del usuario
   * @param assetData - Datos del nuevo activo
   * @returns Promise con el activo creado
   */
  async addAsset(userId: string, assetData: AssetFormData): Promise<Asset> {
    return this.assetRepo.addAsset(userId, assetData);
  }
  
  /**
   * Actualiza un activo existente
   * @param userId - ID del usuario
   * @param assetId - ID del activo a actualizar
   * @param partialData - Datos parciales para actualizar
   * @returns Promise con el activo actualizado
   */
  async updateAsset(userId: string, assetId: string, partialData: Partial<Asset>): Promise<Asset> {
    return this.assetRepo.updateAsset(userId, assetId, partialData);
  }
  
  /**
   * Elimina un activo
   * @param userId - ID del usuario
   * @param assetId - ID del activo a eliminar
   * @returns Promise que resuelve a true si fue eliminado con éxito
   */
  async deleteAsset(userId: string, assetId: string): Promise<boolean> {
    return this.assetRepo.deleteAsset(userId, assetId);
  }
  
  /**
   * Actualiza el valor de un activo
   * @param userId - ID del usuario
   * @param assetId - ID del activo
   * @param newValue - Nuevo valor del activo
   * @returns Promise con el activo actualizado
   */
  async updateAssetValue(userId: string, assetId: string, newValue: number): Promise<Asset> {
    return this.assetRepo.updateAssetValue(userId, assetId, newValue);
  }
  
  /**
   * Suscribe a cambios en los activos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Función para cancelar la suscripción
   */
  subscribeToAssets(userId: string, callback: (assets: Asset[]) => void): () => void {
    return this.assetRepo.subscribeToAssets(userId, callback);
  }
}
