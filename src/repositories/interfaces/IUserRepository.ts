import { IRepository } from './IRepository';
import type { UserProfile } from '../../types';
import type { SupabaseUser } from '../../types/database';

/**
 * Interfaz de repositorio para la gestión de perfiles de usuario
 */
export interface IUserRepository extends IRepository<UserProfile, string> {
  /**
   * Obtiene el perfil de un usuario por su ID
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve al perfil del usuario o null si no existe
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;
  
  /**
   * Crea o actualiza el perfil de un usuario basado en la información de autenticación
   * @param authUser - Usuario autenticado
   * @returns Una promesa que resuelve a true si la operación fue exitosa
   */
  createUserProfile(authUser: any): Promise<boolean>;
}
