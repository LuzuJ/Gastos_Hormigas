import { repositoryFactory } from '../../repositories';
import type { UserProfile } from '../../types';
import type { User } from '@supabase/supabase-js';

/**
 * Servicio para la gestión de usuarios utilizando el patrón repositorio
 */
export const userServiceRepo = {
  /**
   * Crea el perfil inicial de un usuario
   * @param user - Usuario autenticado
   * @returns Una promesa que resuelve a un valor booleano indicando si la operación fue exitosa
   */
  createUserProfile: async (user: User): Promise<boolean> => {
    const userRepository = repositoryFactory.getUserRepository();
    return await userRepository.createUserProfile(user);
  },
  
  /**
   * Obtiene el perfil de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve al perfil del usuario o null si no existe
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const userRepository = repositoryFactory.getUserRepository();
    return await userRepository.getUserProfile(userId);
  },
  
  /**
   * Actualiza el perfil de un usuario
   * @param userId - ID del usuario
   * @param profileData - Datos parciales del perfil a actualizar
   * @returns Una promesa que resuelve al perfil actualizado
   */
  updateUserProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const userRepository = repositoryFactory.getUserRepository();
    return await userRepository.update(userId, userId, profileData);
  },
  
  /**
   * Elimina el perfil de un usuario
   * @param userId - ID del usuario
   * @returns Una promesa que resuelve a un valor booleano indicando si la operación fue exitosa
   */
  deleteUserProfile: async (userId: string): Promise<boolean> => {
    const userRepository = repositoryFactory.getUserRepository();
    return await userRepository.delete(userId, userId);
  }
};
