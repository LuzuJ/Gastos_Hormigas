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
    return this.getAll(userId);
  }
  
  /**
   * Agrega un nuevo gasto
   * @param userId - ID del usuario
   * @param expenseData - Datos del gasto a agregar
   * @returns Una promesa que resuelve al gasto creado
   */
  async addExpense(userId: string, expenseData: ExpenseFormData): Promise<Expense> {
    // Si hay un campo createdAt y es un timestamp de Firebase o una fecha,
    // lo convertimos a string ISO para Supabase
    const formattedData = { ...expenseData };
    if (formattedData.createdAt) {
      formattedData.createdAt = toDate(formattedData.createdAt).toISOString();
    } else {
      // Si no hay fecha, usamos la fecha actual
      formattedData.createdAt = new Date().toISOString();
    }
    
    return this.create(userId, formattedData);
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
    // Primero, cargar los datos existentes
    this.getExpenses(userId)
      .then(expenses => {
        callback(expenses);
      })
      .catch(error => {
        console.error('Error loading initial expenses:', error);
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
        () => {
          // Cuando hay cambios, obtenemos los gastos actualizados
          this.getExpenses(userId)
            .then(expenses => {
              callback(expenses);
            })
            .catch(error => {
              console.error('Error al obtener gastos después de cambios:', error);
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
