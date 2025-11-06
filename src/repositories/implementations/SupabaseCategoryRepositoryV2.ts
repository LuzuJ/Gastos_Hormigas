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
   * Inicializa todos los datos por defecto para un usuario nuevo (categorías, métodos de pago, logros, etc.)
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a true si la operación fue exitosa
   */
  async initializeCompleteUserData(userId: string): Promise<boolean> {
    try {
      // NOTA: El trigger handle_new_user() en la BD ya crea automáticamente:
      // - Perfil de usuario en la tabla users
      // - 9 categorías predefinidas
      // - 3 métodos de pago predefinidos
      // - Datos financieros iniciales
      // - Estadísticas de usuario
      // - Estadísticas del mes actual
      // Por lo tanto, NO necesitamos crear datos manualmente aquí
      
      console.log('[SupabaseCategoryRepositoryV2] El trigger handle_new_user() ya inicializó los datos del usuario');
      return true;
    } catch (error) {
      console.error('Error al verificar inicialización de datos del usuario:', error);
      return false;
    }
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
        // Usar la función completa de inicialización que incluye todo
        return await this.initializeCompleteUserData(userId);
      }
      
      return true;
    } catch (error) {
      console.error('Error al inicializar categorías por defecto:', error);
      return false;
    }
  }

  /**
   * Crea categorías por defecto manualmente (fallback si la función RPC no está disponible)
   * @param userId - ID del usuario
   */
  private async createDefaultCategoriesManually(userId: string): Promise<void> {
    const defaultCategories = [
      { name: 'Alimento', icon: 'Pizza', color: '#FFC300', subcategories: ['Supermercado', 'Restaurante', 'Delivery'] },
      { name: 'Transporte', icon: 'Car', color: '#FF5733', subcategories: ['Gasolina', 'Transporte Público', 'Taxi/Uber'] },
      { name: 'Hogar', icon: 'Home', color: '#C70039', subcategories: ['Servicios (Luz, Agua)', 'Decoración', 'Reparaciones'] },
      { name: 'Entretenimiento', icon: 'Gamepad2', color: '#900C3F', subcategories: ['Suscripciones', 'Cine', 'Salidas'] },
      { name: 'Salud', icon: 'HeartPulse', color: '#581845', subcategories: ['Farmacia', 'Consulta Médica'] },
      { name: 'Otro', icon: 'ShoppingBag', color: '#2a9d8f', subcategories: ['General'] }
    ];

    for (const categoryData of defaultCategories) {
      try {
        // Crear la categoría
        const { data: category, error: categoryError } = await this.client
          .from(SUPABASE_TABLES.CATEGORIES)
          .insert({
            user_id: userId,
            name: categoryData.name,
            icon: categoryData.icon,
            color: categoryData.color,
            is_active: true
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        // Crear las subcategorías
        for (const subCategoryName of categoryData.subcategories) {
          const { error: subCategoryError } = await this.client
            .from(SUPABASE_TABLES.SUBCATEGORIES)
            .insert({
              category_id: category.id,
              name: subCategoryName
            });

          if (subCategoryError) {
            console.error(`Error creating subcategory ${subCategoryName}:`, subCategoryError);
          }
        }
      } catch (error) {
        console.error(`Error creating category ${categoryData.name}:`, error);
      }
    }

    // También crear estadísticas de usuario y financials
    try {
      await this.client.from('user_stats').insert({ user_id: userId }).select().single();
    } catch (error) {
      // Ignorar si ya existe
    }

    try {
      await this.client.from('financials').insert({ user_id: userId }).select().single();
    } catch (error) {
      // Ignorar si ya existe
    }
  }
  
  /**
   * Obtiene todas las categorías con sus subcategorías
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de categorías con sus subcategorías
   */
  async getCategoriesWithSubcategories(userId: string): Promise<Category[]> {
    try {
      console.log('[SupabaseCategoryRepositoryV2] Obteniendo categorías para usuario:', userId);
      
      const { data, error } = await this.client
        .from(SUPABASE_TABLES.CATEGORIES)
        .select(`
          id,
          name,
          icon,
          color,
          description,
          budget_amount,
          is_active,
          subcategories (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('name');
      
      if (error) {
        console.error('[SupabaseCategoryRepositoryV2] Error de Supabase al obtener categorías:', error);
        throw error;
      }
      
      console.log('[SupabaseCategoryRepositoryV2] Categorías obtenidas:', data?.length || 0);
      
      return data?.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon || undefined,
        color: category.color || undefined,
        isDefault: true, // Todas son por defecto en el nuevo esquema
        budget: category.budget_amount || undefined,
        subcategories: (category.subcategories || []).map(subcategory => ({
          id: subcategory.id,
          name: subcategory.name
        }))
      })) || [];
    } catch (error) {
      console.error('[SupabaseCategoryRepositoryV2] Error al obtener categorías con subcategorías:', error);
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
    // IMPORTANTE: Cargar datos iniciales inmediatamente
    console.log('[SupabaseCategoryRepositoryV2] Cargando datos iniciales para suscripción');
    this.getCategoriesWithSubcategories(userId)
      .then(categories => {
        console.log('[SupabaseCategoryRepositoryV2] Datos iniciales cargados:', categories.length);
        callback(categories);
      })
      .catch(error => {
        console.error('[SupabaseCategoryRepositoryV2] Error al cargar datos iniciales:', error);
        callback([]); // Llamar callback con array vacío para desbloquear la UI
      });
    
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
          console.log('[SupabaseCategoryRepositoryV2] Cambio detectado en categories');
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
          console.log('[SupabaseCategoryRepositoryV2] Cambio detectado en subcategories');
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
      isDefault: true, // Todas son por defecto en el nuevo esquema
      budget: data.budget_amount || undefined,
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
    if (data.description !== undefined) {
      databaseData.description = data.description;
    }
    if (data.budget !== undefined) {
      databaseData.budget_amount = data.budget;
    }
    if (data.isActive !== undefined) {
      databaseData.is_active = data.isActive;
    }
    if (data.user_id !== undefined) {
      databaseData.user_id = data.user_id;
    }
    
    return databaseData;
  }
}
