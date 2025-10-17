import { repositoryFactory } from '../../repositories';
import type { Category, SubCategory } from '../../types';

/**
 * Servicio para la gestión de categorías utilizando el patrón repositorio
 */
export const categoryServiceRepo = {
  /**
   * Inicializa las categorías por defecto para un usuario nuevo
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a true si la operación fue exitosa
   */
  initializeDefaultCategories: async (userId: string): Promise<boolean> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.initializeDefaultCategories(userId);
  },
  
  /**
   * Obtiene todas las categorías con sus subcategorías
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de categorías con sus subcategorías
   */
  getCategories: async (userId: string): Promise<Category[]> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.getCategoriesWithSubcategories(userId);
  },
  
  /**
   * Obtiene una categoría específica por su ID
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @returns Una promesa que resuelve a la categoría o null si no existe
   */
  getCategory: async (userId: string, categoryId: string): Promise<Category | null> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.getById(categoryId);
  },
  
  /**
   * Añade una nueva categoría
   * @param userId - ID del usuario
   * @param categoryName - Nombre de la categoría
   * @param icon - Icono para la categoría
   * @param color - Color para la categoría
   * @returns Una promesa que resuelve a la categoría creada
   */
  addCategory: async (userId: string, categoryName: string, icon: string = 'Tag', color: string = '#607D8B'): Promise<Category> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.create(userId, {
      name: categoryName,
      icon,
      color,
      isDefault: false,
      subcategories: []
    });
  },
  
  /**
   * Elimina una categoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteCategory: async (userId: string, categoryId: string): Promise<boolean> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.delete(userId, categoryId);
  },
  
  /**
   * Añade una subcategoría a una categoría existente
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryName - Nombre de la subcategoría
   * @returns Una promesa que resuelve a la subcategoría creada
   */
  addSubCategory: async (userId: string, categoryId: string, subcategoryName: string): Promise<SubCategory> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.addSubcategory(userId, categoryId, subcategoryName);
  },
  
  /**
   * Elimina una subcategoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryId - ID de la subcategoría
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  deleteSubCategory: async (userId: string, categoryId: string, subcategoryId: string): Promise<boolean> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.deleteSubcategory(userId, categoryId, subcategoryId);
  },
  
  /**
   * Actualiza el presupuesto de una categoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param budget - Presupuesto asignado
   * @returns Una promesa que resuelve a la categoría actualizada
   */
  updateCategoryBudget: async (userId: string, categoryId: string, budget: number): Promise<Category> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.update(userId, categoryId, { budget });
  },
  
  /**
   * Actualiza el estilo (icono y color) de una categoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param style - Objeto con el icono y color
   * @returns Una promesa que resuelve a la categoría actualizada
   */
  updateCategoryStyle: async (userId: string, categoryId: string, style: { icon: string; color: string }): Promise<Category> => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return await categoryRepository.update(userId, categoryId, style);
  },
  
  /**
   * Suscribe a cambios en las categorías de un usuario en tiempo real
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  onCategoriesUpdate: (userId: string, callback: (categories: Category[]) => void): (() => void) => {
    const categoryRepository = repositoryFactory.getCategoryRepository();
    return categoryRepository.subscribeToCategories(userId, callback);
  }
};
