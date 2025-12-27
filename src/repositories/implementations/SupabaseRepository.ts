import { supabase } from '../../config/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IRepository } from '../interfaces/IRepository';

/**
 * Implementación base del repositorio para Supabase
 * Proporciona funcionalidad CRUD básica para cualquier entidad en Supabase
 */
export abstract class SupabaseRepository<T, ID, CreateDTO = Omit<T, 'id'>, UpdateDTO = Partial<T>> 
  implements IRepository<T, ID, CreateDTO, UpdateDTO> {
  
  protected client: SupabaseClient;
  protected tableName: string;
  
  /**
   * Constructor
   * @param tableName - Nombre de la tabla en Supabase
   */
  constructor(tableName: string) {
    this.client = supabase;
    this.tableName = tableName;
  }
  
  /**
   * Obtiene una entidad por su ID
   * @param id - ID único de la entidad
   * @returns Una promesa que resuelve a la entidad si existe, o null si no existe
   */
  async getById(id: ID): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return this.mapDatabaseToModel(data);
    } catch (error) {
      console.error(`Error al obtener ${this.tableName} por ID:`, error);
      return null;
    }
  }
  
  /**
   * Obtiene todas las entidades que pertenecen a un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un array de entidades
   */
  async getAll(userId: string): Promise<T[]> {
    try {
      console.log(`[SupabaseRepository] Obteniendo datos de ${this.tableName} para usuario:`, userId);
      
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error(`[SupabaseRepository] Error de Supabase en ${this.tableName}:`, error);
        throw error;
      }
      
      console.log(`[SupabaseRepository] Datos obtenidos de ${this.tableName}:`, data?.length || 0, 'registros');
      
      return data.map(this.mapDatabaseToModel.bind(this));
    } catch (error) {
      console.error(`[SupabaseRepository] Error al obtener todos los ${this.tableName}:`, error);
      return [];
    }
  }
  
  /**
   * Crea una nueva entidad
   * @param userId - ID del usuario
   * @param data - Datos para crear la entidad
   * @returns Una promesa que resuelve a la entidad creada
   */
  async create(userId: string, data: CreateDTO): Promise<T> {
    try {
      const databaseData = this.mapModelToDatabase({
        ...data as object,
        user_id: userId
      });
      
      console.log(`[SupabaseRepository] Creating in ${this.tableName} with userId:`, userId);
      console.log(`[SupabaseRepository] Database data to insert:`, databaseData);
      
      const { data: createdData, error } = await this.client
        .from(this.tableName)
        .insert(databaseData)
        .select()
        .single();
      
      if (error) {
        console.error(`[SupabaseRepository] ❌ Supabase INSERT error in ${this.tableName}:`, error);
        console.error(`[SupabaseRepository] Error details:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      if (!createdData) {
        console.error(`[SupabaseRepository] ❌ No data returned after INSERT in ${this.tableName}`);
        throw new Error(`No se pudo crear el registro en ${this.tableName}`);
      }
      
      console.log(`[SupabaseRepository] ✅ Successfully created in ${this.tableName}:`, createdData);
      
      return this.mapDatabaseToModel(createdData);
    } catch (error) {
      console.error(`[SupabaseRepository] ❌ Exception in create() for ${this.tableName}:`, error);
      throw error;
    }
  }
  
  /**
   * Actualiza una entidad existente
   * @param userId - ID del usuario
   * @param id - ID de la entidad a actualizar
   * @param data - Datos parciales para actualizar la entidad
   * @returns Una promesa que resuelve a la entidad actualizada
   */
  async update(userId: string, id: ID, data: UpdateDTO): Promise<T> {
    try {
      const databaseData = this.mapModelToDatabase(data as object);
      
      const { data: updatedData, error } = await this.client
        .from(this.tableName)
        .update(databaseData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return this.mapDatabaseToModel(updatedData);
    } catch (error) {
      console.error(`Error al actualizar ${this.tableName}:`, error);
      throw error;
    }
  }
  
  /**
   * Elimina una entidad
   * @param userId - ID del usuario
   * @param id - ID de la entidad a eliminar
   * @returns Una promesa que resuelve a true si la eliminación fue exitosa
   */
  async delete(userId: string, id: ID): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Error al eliminar ${this.tableName}:`, error);
      return false;
    }
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * Las clases hijas deben implementar este método según sea necesario
   * @param data - Datos de la base de datos
   * @returns El modelo de dominio
   */
  protected abstract mapDatabaseToModel(data: any): T;
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * Las clases hijas deben implementar este método según sea necesario
   * @param data - Datos del modelo de dominio
   * @returns El objeto formateado para la base de datos
   */
  protected abstract mapModelToDatabase(data: any): Record<string, any>;
}
