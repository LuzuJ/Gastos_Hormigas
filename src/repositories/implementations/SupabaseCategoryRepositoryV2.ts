import { SupabaseRepository } from './SupabaseRepository';
import type { ICategoryRepository } from '../interfaces/ICategoryRepository';
import type { Category, SubCategory } from '../../types';
import { SUPABASE_TABLES } from '../../constants';

/**
 * Implementación del repositorio de categorías para Supabase
 */
export class SupabaseCategoryRepositoryV2 extends SupabaseRepository<Category, string> implements ICategoryRepository {
  
  constructor() {
    super(SUPABASE_TABLES.CATEGORIES);
  }
  
  /**
   * Inicializa las categorías por defecto para un usuario nuevo
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a true si la operación fue exitosa
   */
  async initializeDefaultCategories(userId: string): Promise<boolean> {
    try {
      // Verificar si ya existen categorías para este usuario
      const { data: existingCategories, error: checkError } = await this.client
        .from(SUPABASE_TABLES.CATEGORIES)
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (checkError) {
        throw checkError;
      }
      
      if (!existingCategories || existingCategories.length === 0) {
        // Crear categorías por defecto usando la función de inicialización
        const { error } = await this.client.rpc('initialize_default_categories', { user_id: userId });
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error al inicializar categorías por defecto:', error);
      return false;
    }
  }
  
  /**
   * Obtiene todas las categorías con sus subcategorías
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de categorías con sus subcategorías
   */
  async getCategoriesWithSubcategories(userId: string): Promise<Category[]> {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_TABLES.CATEGORIES)
        .select(`
          id,
          name,
          icon,
          color,
          is_default,
          budget,
          subcategories (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      return data?.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon || undefined,
        color: category.color || undefined,
        isDefault: category.is_default,
        budget: category.budget || undefined,
        subcategories: (category.subcategories || []).map(subcategory => ({
          id: subcategory.id,
          name: subcategory.name
        }))
      })) || [];
    } catch (error) {
      console.error('Error al obtener categorías con subcategorías:', error);
      return [];
    }
  }
  
  /**
   * Añade una subcategoría a una categoría existente
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryName - Nombre de la subcategoría
   * @returns Una promesa que resuelve a la subcategoría creada
   */
  async addSubcategory(userId: string, categoryId: string, subcategoryName: string): Promise<SubCategory> {
    try {
      // Verificar que la categoría pertenece al usuario
      const { data: categoryData, error: categoryError } = await this.client
        .from(SUPABASE_TABLES.CATEGORIES)
        .select('id')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();
      
      if (categoryError) throw categoryError;
      if (!categoryData) throw new Error('La categoría no existe o no pertenece al usuario');
      
      const { data, error } = await this.client
        .from(SUPABASE_TABLES.SUBCATEGORIES)
        .insert({
          category_id: categoryId,
          name: subcategoryName
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name
      };
    } catch (error) {
      console.error('Error al añadir subcategoría:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una subcategoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryId - ID de la subcategoría
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async deleteSubcategory(userId: string, categoryId: string, subcategoryId: string): Promise<boolean> {
    try {
      // Verificar que la categoría pertenece al usuario
      const { data: categoryData, error: categoryError } = await this.client
        .from(SUPABASE_TABLES.CATEGORIES)
        .select('id')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();
      
      if (categoryError) throw categoryError;
      if (!categoryData) throw new Error('La categoría no existe o no pertenece al usuario');
      
      // Eliminar la subcategoría
      const { error } = await this.client
        .from(SUPABASE_TABLES.SUBCATEGORIES)
        .delete()
        .eq('id', subcategoryId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error al eliminar subcategoría:', error);
      return false;
    }
  }
  
  /**
   * Actualiza una subcategoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryId - ID de la subcategoría
   * @param name - Nuevo nombre para la subcategoría
   * @returns Una promesa que resuelve a la subcategoría actualizada
   */
  async updateSubcategory(userId: string, categoryId: string, subcategoryId: string, name: string): Promise<SubCategory> {
    try {
      // Verificar que la categoría pertenece al usuario
      const { data: categoryData, error: categoryError } = await this.client
        .from(SUPABASE_TABLES.CATEGORIES)
        .select('id')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();
      
      if (categoryError) throw categoryError;
      if (!categoryData) throw new Error('La categoría no existe o no pertenece al usuario');
      
      // Actualizar la subcategoría
      const { data, error } = await this.client
        .from(SUPABASE_TABLES.SUBCATEGORIES)
        .update({ name })
        .eq('id', subcategoryId)
        .eq('category_id', categoryId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name
      };
    } catch (error) {
      console.error('Error al actualizar subcategoría:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza el presupuesto de una categoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param budget - Presupuesto asignado
   * @returns Una promesa que resuelve a la categoría actualizada
   */
  async updateCategoryBudget(userId: string, categoryId: string, budget: number): Promise<Category> {
    return this.update(userId, categoryId, { budget });
  }
  
  /**
   * Actualiza el estilo (icono y color) de una categoría
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param style - Objeto con el icono y color
   * @returns Una promesa que resuelve a la categoría actualizada
   */
  async updateCategoryStyle(userId: string, categoryId: string, style: { icon: string; color: string }): Promise<Category> {
    return this.update(userId, categoryId, style);
  }
  
  /**
   * Suscribe a cambios en las categorías del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToCategories(userId: string, callback: (categories: Category[]) => void): () => void {
    // Crear un canal para las categorías
    const channel = this.client
      .channel(`${SUPABASE_TABLES.CATEGORIES}-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: SUPABASE_TABLES.CATEGORIES,
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          // Cuando hay cambios, obtenemos las categorías actualizadas
          this.getCategoriesWithSubcategories(userId)
            .then(categories => {
              callback(categories);
            })
            .catch(error => {
              console.error('Error al obtener categorías después de cambios:', error);
            });
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.SUBCATEGORIES
        },
        () => {
          // Cuando hay cambios en subcategorías
          this.getCategoriesWithSubcategories(userId)
            .then(categories => {
              callback(categories);
            })
            .catch(error => {
              console.error('Error al obtener categorías después de cambios en subcategorías:', error);
            });
        }
      )
      .subscribe();
    
    // Devolver función para cancelar la suscripción
    return () => {
      this.client.removeChannel(channel);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos
   * @returns El modelo de dominio (Category)
   */
  protected mapDatabaseToModel(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      icon: data.icon || undefined,
      color: data.color || undefined,
      isDefault: data.is_default,
      budget: data.budget || undefined,
      subcategories: (data.subcategories || []).map((subcategory: any) => ({
        id: subcategory.id,
        name: subcategory.name
      }))
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (Category)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: any): Record<string, any> {
    const databaseData: Record<string, any> = {};
    
    if (data.name !== undefined) {
      databaseData.name = data.name;
    }
    if (data.icon !== undefined) {
      databaseData.icon = data.icon;
    }
    if (data.color !== undefined) {
      databaseData.color = data.color;
    }
    if (data.isDefault !== undefined) {
      databaseData.is_default = data.isDefault;
    }
    if (data.budget !== undefined) {
      databaseData.budget = data.budget;
    }
    if (data.user_id !== undefined) {
      databaseData.user_id = data.user_id;
    }
    
    return databaseData;
  }
}
