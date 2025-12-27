import { SupabaseRepository } from './SupabaseRepository';
import type { IExpenseRepository } from '../interfaces/IExpenseRepository';
import type { Expense, ExpenseFormData } from '../../types';
import { SUPABASE_TABLES } from '../../constants';
import { toDate } from '../../utils/dateUtils';

/**
 * Implementación del repositorio de gastos para Supabase
 */
export class SupabaseExpenseRepository 
  extends SupabaseRepository<Expense, string, ExpenseFormData> 
  implements IExpenseRepository {
  
  /**
   * Constructor
   */
  constructor() {
    super(SUPABASE_TABLES.EXPENSES);
  }
  
  /**
   * Obtiene los gastos de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de gastos
   */
  async getExpenses(userId: string): Promise<Expense[]> {
    try {
      console.log('[SupabaseExpenseRepository] Fetching expenses for user:', userId);
      
      // Hacer JOIN con subcategories para obtener el nombre en lugar del ID
      const { data, error } = await this.client
        .from(this.tableName)
        .select(`
          *,
          subcategories:subcategory_id (
            name
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('[SupabaseExpenseRepository] Error fetching expenses:', error);
        throw error;
      }
      
      console.log('[SupabaseExpenseRepository] Fetched expenses:', data?.length || 0);
      
      // Mapear los datos incluyendo el nombre de la subcategoría
      return (data || []).map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        categoryId: expense.category_id,
        subCategory: expense.subcategories?.name || '', // Obtener el nombre desde el JOIN
        createdAt: expense.date || expense.created_at,
        paymentSourceId: expense.payment_source_id || undefined
      }));
    } catch (error) {
      console.error('[SupabaseExpenseRepository] Error in getExpenses:', error);
      throw error;
    }
  }
  
  /**
   * Agrega un nuevo gasto
   * @param userId - ID del usuario
   * @param expenseData - Datos del gasto a agregar
   * @returns Una promesa que resuelve al gasto creado
   */
  async addExpense(userId: string, expenseData: ExpenseFormData): Promise<Expense> {
    console.log('[SupabaseExpenseRepository] addExpense called with userId:', userId);
    console.log('[SupabaseExpenseRepository] addExpense called with data:', expenseData);
    
    // Si hay un campo createdAt y es un timestamp de Firebase o una fecha,
    // lo convertimos a string ISO para Supabase
    const formattedData = { ...expenseData };
    if (formattedData.createdAt) {
      formattedData.createdAt = toDate(formattedData.createdAt).toISOString();
    } else {
      // Si no hay fecha, usamos la fecha actual
      formattedData.createdAt = new Date().toISOString();
    }
    
    console.log('[SupabaseExpenseRepository] Fecha formateada:', formattedData.createdAt);
    
    // CRÍTICO: Convertir el nombre de subcategoría (string) a ID (UUID)
    // El formulario envía subCategory como nombre (ej: "Supermercado")
    // pero la BD espera subcategory_id como UUID
    if (formattedData.subCategory && formattedData.categoryId) {
      console.log(`[SupabaseExpenseRepository] Buscando subcategoría "${formattedData.subCategory}" en categoría ${formattedData.categoryId}`);
      
      const subcategoryId = await this.getSubcategoryIdByName(
        userId, 
        formattedData.categoryId, 
        formattedData.subCategory
      );
      
      if (!subcategoryId) {
        console.error(`[SupabaseExpenseRepository] No se encontró subcategoría con nombre "${formattedData.subCategory}" en categoría ${formattedData.categoryId}`);
        throw new Error(`No se encontró la subcategoría "${formattedData.subCategory}"`);
      }
      
      console.log(`[SupabaseExpenseRepository] Subcategoría "${formattedData.subCategory}" convertida a ID: ${subcategoryId}`);
      formattedData.subCategory = subcategoryId; // Reemplazar nombre por ID
    }
    
    console.log('[SupabaseExpenseRepository] Datos finales antes de create():', formattedData);
    
    try {
      const result = await this.create(userId, formattedData);
      console.log('[SupabaseExpenseRepository] Gasto creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('[SupabaseExpenseRepository] Error en create():', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el ID de una subcategoría por su nombre
   * @param userId - ID del usuario
   * @param categoryId - ID de la categoría
   * @param subcategoryName - Nombre de la subcategoría
   * @returns El ID de la subcategoría o null si no se encuentra
   */
  private async getSubcategoryIdByName(
    userId: string, 
    categoryId: string, 
    subcategoryName: string
  ): Promise<string | null> {
    try {
      console.log('[SupabaseExpenseRepository] getSubcategoryIdByName - userId:', userId);
      console.log('[SupabaseExpenseRepository] getSubcategoryIdByName - categoryId:', categoryId);
      console.log('[SupabaseExpenseRepository] getSubcategoryIdByName - subcategoryName:', subcategoryName);
      
      // Primero verificar que la categoría pertenece al usuario
      const { data: categoryData, error: categoryError } = await this.client
        .from(SUPABASE_TABLES.CATEGORIES)
        .select('id')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();
      
      if (categoryError) {
        console.error('[SupabaseExpenseRepository] Error verificando categoría:', categoryError);
        return null;
      }
      
      if (!categoryData) {
        console.error('[SupabaseExpenseRepository] Categoría no encontrada o no pertenece al usuario');
        return null;
      }
      
      console.log('[SupabaseExpenseRepository] Categoría verificada:', categoryData);
      
      // Buscar la subcategoría por nombre dentro de la categoría
      const { data: subcategoryData, error: subcategoryError } = await this.client
        .from(SUPABASE_TABLES.SUBCATEGORIES)
        .select('id, name')
        .eq('category_id', categoryId)
        .eq('name', subcategoryName)
        .single();
      
      if (subcategoryError) {
        console.error('[SupabaseExpenseRepository] Error buscando subcategoría:', subcategoryError);
        
        // Si no se encuentra, listar todas las subcategorías disponibles para debug
        const { data: allSubcategories } = await this.client
          .from(SUPABASE_TABLES.SUBCATEGORIES)
          .select('id, name')
          .eq('category_id', categoryId);
        
        console.log('[SupabaseExpenseRepository] Subcategorías disponibles en esta categoría:', allSubcategories);
        return null;
      }
      
      if (!subcategoryData) {
        console.error('[SupabaseExpenseRepository] Subcategoría no encontrada');
        return null;
      }
      
      console.log('[SupabaseExpenseRepository] Subcategoría encontrada:', subcategoryData);
      return subcategoryData.id;
    } catch (error) {
      console.error('[SupabaseExpenseRepository] Error buscando subcategoría:', error);
      return null;
    }
  }
  
  /**
   * Actualiza un gasto existente
   * @param userId - ID del usuario
   * @param expenseId - ID del gasto a actualizar
   * @param partialData - Datos parciales para actualizar el gasto
   * @returns Una promesa que resuelve al gasto actualizado
   */
  async updateExpense(userId: string, expenseId: string, partialData: Partial<ExpenseFormData>): Promise<Expense> {
    // Si hay un campo createdAt en los datos a actualizar y es una fecha (de Firebase),
    // lo convertimos a string ISO para Supabase
    if (partialData.createdAt) {
      partialData.createdAt = toDate(partialData.createdAt).toISOString();
    }
    
    // CRÍTICO: Si se está actualizando la subcategoría, convertir nombre a ID
    if (partialData.subCategory && partialData.categoryId) {
      const subcategoryId = await this.getSubcategoryIdByName(
        userId, 
        partialData.categoryId, 
        partialData.subCategory
      );
      
      if (!subcategoryId) {
        console.error(`[SupabaseExpenseRepository] No se encontró subcategoría con nombre "${partialData.subCategory}"`);
        throw new Error(`No se encontró la subcategoría "${partialData.subCategory}"`);
      }
      
      partialData.subCategory = subcategoryId; // Reemplazar nombre por ID
    }
    
    return this.update(userId, expenseId, partialData);
  }
  
  /**
   * Elimina un gasto
   * @param userId - ID del usuario
   * @param expenseId - ID del gasto a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async deleteExpense(userId: string, expenseId: string): Promise<boolean> {
    return this.delete(userId, expenseId);
  }
  
  /**
   * Suscribe a cambios en los gastos del usuario
   * @param userId - ID del usuario
   * @param callback - Función de callback que se ejecutará cuando haya cambios
   * @returns Una función para cancelar la suscripción
   */
  subscribeToExpenses(userId: string, callback: (expenses: Expense[]) => void): () => void {
    console.log('[SupabaseExpenseRepository] Setting up subscription for userId:', userId);
    
    // Primero, cargar los datos existentes
    this.getExpenses(userId)
      .then(expenses => {
        console.log('[SupabaseExpenseRepository] Initial expenses loaded:', expenses.length);
        callback(expenses);
      })
      .catch(error => {
        console.error('[SupabaseExpenseRepository] Error loading initial expenses:', error);
        callback([]);
      });
    
    // Crear un canal para los gastos
    const channel = this.client
      .channel(`${SUPABASE_TABLES.EXPENSES}-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: SUPABASE_TABLES.EXPENSES,
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('[SupabaseExpenseRepository] Received real-time update:', payload);
          
          // Cuando hay cambios, obtenemos los gastos actualizados
          this.getExpenses(userId)
            .then(expenses => {
              console.log('[SupabaseExpenseRepository] Updated expenses after change:', expenses.length);
              callback(expenses);
            })
            .catch(error => {
              console.error('[SupabaseExpenseRepository] Error al obtener gastos después de cambios:', error);
            });
        }
      )
      .subscribe((status, err) => {
        console.log('[SupabaseExpenseRepository] Subscription status:', status);
        if (err) {
          console.error('[SupabaseExpenseRepository] Subscription error:', err);
        }
      });
    
    // Devolver función para cancelar la suscripción
    return () => {
      console.log('[SupabaseExpenseRepository] Unsubscribing from expenses');
      this.client.removeChannel(channel);
    };
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos
   * @returns El modelo de dominio (Expense)
   */
  protected mapDatabaseToModel(data: any): Expense {
    return {
      id: data.id,
      description: data.description,
      amount: data.amount,
      categoryId: data.category_id,
      subCategory: data.subcategory_id || '', // subcategory_id es UUID en BD, string en modelo
      createdAt: data.date || data.created_at, // date es la fecha del gasto
      paymentSourceId: data.payment_source_id || undefined
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (ExpenseFormData o parciales)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: any): Record<string, any> {
    const databaseData: Record<string, any> = {};
    
    if (data.description !== undefined) {
      databaseData.description = data.description;
    }
    if (data.amount !== undefined) {
      databaseData.amount = data.amount;
    }
    if (data.categoryId !== undefined) {
      databaseData.category_id = data.categoryId;
    }
    if (data.subCategory !== undefined) {
      // subCategory en el modelo es string, pero subcategory_id en BD es UUID
      // Si es un UUID válido, lo usamos; si no, lo dejamos null
      databaseData.subcategory_id = data.subCategory || null;
    }
    if (data.createdAt !== undefined) {
      // createdAt del modelo se mapea a 'date' (fecha del gasto)
      databaseData.date = data.createdAt;
    }
    if (data.paymentSourceId !== undefined) {
      databaseData.payment_source_id = data.paymentSourceId;
    }
    if (data.notes !== undefined) {
      databaseData.notes = data.notes;
    }
    if (data.isFixed !== undefined) {
      databaseData.is_fixed = data.isFixed;
    }
    if (data.tags !== undefined) {
      databaseData.tags = data.tags;
    }
    if (data.user_id !== undefined) {
      databaseData.user_id = data.user_id;
    }
    
    return databaseData;
  }
}
