import { SupabaseRepository } from './SupabaseRepository';
import type { IUserRepository } from '../interfaces/IUserRepository';
import type { UserProfile } from '../../types';
import type { SupabaseUser } from '../../types/database';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_TABLES } from '../../constants';

/**
 * Implementación del repositorio de usuarios para Supabase
 */
export class SupabaseUserRepository extends SupabaseRepository<UserProfile, string> implements IUserRepository {
  
  constructor() {
    super(SUPABASE_TABLES.USERS);
  }
  
  /**
   * Obtiene el perfil de un usuario por su ID
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve al perfil del usuario o null si no existe
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.client
        .from(SUPABASE_TABLES.USERS)
        .select('display_name, email, currency, avatar_url, theme, language')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }
      
      if (data) {
        return {
          displayName: data.display_name || 'Usuario',
          email: data.email || '',
          currency: data.currency || 'USD',
          avatarUrl: data.avatar_url,
          theme: data.theme,
          language: data.language,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener el perfil de usuario:', error);
      return null;
    }
  }
  
  /**
   * Crea o actualiza el perfil de un usuario basado en la información de autenticación
   * @param user - Usuario autenticado
   * @returns Una promesa que resuelve a true si la operación fue exitosa
   */
  async createUserProfile(user: User): Promise<boolean> {
    try {
      // Verificar si ya existe el perfil
      const { data: existingUser, error: checkError } = await this.client
        .from(SUPABASE_TABLES.USERS)
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }
      
      // Si no existe, crear el perfil
      if (!existingUser) {
        const profileData = {
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          currency: 'USD' as const,
        };
        
        const { error } = await this.client
          .from(SUPABASE_TABLES.USERS)
          .insert([profileData]);
        
        if (error) {
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al crear el perfil de usuario:', error);
      return false;
    }
  }
  
  /**
   * Convierte un objeto de la base de datos al modelo de dominio
   * @param data - Datos de la base de datos (SupabaseUser)
   * @returns El modelo de dominio (UserProfile)
   */
  protected mapDatabaseToModel(data: SupabaseUser): UserProfile {
    return {
      displayName: data.display_name || 'Usuario',
      email: data.email || '',
      currency: data.currency || 'USD',
      avatarUrl: data.avatar_url,
      theme: data.theme,
      language: data.language,
    };
  }
  
  /**
   * Convierte un objeto del modelo de dominio al formato de la base de datos
   * @param data - Datos del modelo de dominio (UserProfile)
   * @returns El objeto formateado para la base de datos
   */
  protected mapModelToDatabase(data: Partial<UserProfile>): Partial<SupabaseUser> {
    const databaseData: Partial<SupabaseUser> = {};
    
    if (data.displayName !== undefined) {
      databaseData.display_name = data.displayName;
    }
    if (data.email !== undefined) {
      databaseData.email = data.email;
    }
    if (data.currency !== undefined) {
      databaseData.currency = data.currency;
    }
    if (data.avatarUrl !== undefined) {
      databaseData.avatar_url = data.avatarUrl;
    }
    if (data.theme !== undefined) {
      databaseData.theme = data.theme;
    }
    if (data.language !== undefined) {
      databaseData.language = data.language;
    }
    
    return databaseData;
  }
}
