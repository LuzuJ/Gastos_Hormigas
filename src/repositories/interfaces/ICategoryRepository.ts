import { IRepository } from './IRepository';
import type { Category, SubCategory } from '../../types';

/**
 * Interfaz de repositorio para la gestión de categorías
 */
export interface ICategoryRepository extends IRepository<Category, string> {
  /**
   * Inicializa las categorías por defecto para un usuario nuevo
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a true si la operación fue exitosa
   */
  initializeDefaultCategories(userId: string): Promise<boolean>;
  
  /**
   * Obtiene todas las categorías con sus subcategorías
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de categorías con sus subcategorías
   */
  getCategoriesWithSubcategories(userId: string): Promise<Category[]>;
  
  /**
   * Añade una subcategoría a una categoría existente
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryName - Nombre de la subcategoría
   * @returns Una promesa que resuelve a la subcategoría creada
   */
  addSubcategory(userId: string, categoryId: string, subcategoryName: string): Promise<SubCategory>;
  
  /**
   * Elimina una subcategoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryId - ID de la subcategoría
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteSubcategory(userId: string, categoryId: string, subcategoryId: string): Promise<boolean>;
  
  /**
   * Actualiza una subcategoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryId - ID de la subcategoría
   * @param name - Nuevo nombre para la subcategoría
   * @returns Una promesa que resuelve a la subcategoría actualizada
   */
  updateSubcategory(userId: string, categoryId: string, subcategoryId: string, name: string): Promise<SubCategory>;
  
  /**
   * Suscribe a cambios en las categorías del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToCategories(userId: string, callback: (categories: Category[]) => void): () => void;
}
