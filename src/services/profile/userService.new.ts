import { repositoryFactory } from '../../repositories';
import type { UserProfile } from '../../types';
import type { User } from '@supabase/supabase-js';

/**
 * Servicio de usuario que utiliza el repositorio a través del patrón de repositorio
 */
export const userService = {
    /**
     * Crea el perfil inicial de un usuario
     * @param user - Usuario autenticado
     */
    createUserProfile: async (user: User) => {
        try {
            const userRepository = repositoryFactory.getUserRepository();
            return await userRepository.createUserProfile(user);
        } catch (error) {
            console.error('Error al crear el perfil de usuario:', error);
            throw error;
        }
    },

    /**
     * Obtiene el perfil de un usuario
     * @param userId - ID del usuario
     * @returns Una promesa que resuelve al perfil del usuario o null si no existe
     */
    getUserProfile: async (userId: string): Promise<UserProfile | null> => {
        try {
            const userRepository = repositoryFactory.getUserRepository();
            return await userRepository.getUserProfile(userId);
        } catch (error) {
            console.error('Error al obtener el perfil de usuario:', error);
            return null;
        }
    },

    /**
     * Actualiza el perfil de un usuario
     * @param userId - ID del usuario
     * @param profileData - Datos parciales para actualizar el perfil
     * @returns Una promesa que resuelve al perfil actualizado
     */
    updateUserProfile: async (userId: string, profileData: Partial<UserProfile>) => {
        try {
            const userRepository = repositoryFactory.getUserRepository();
            return await userRepository.update(userId, userId, profileData);
        } catch (error) {
            console.error('Error al actualizar el perfil de usuario:', error);
            throw error;
        }
    },

    /**
     * Elimina el perfil de un usuario
     * @param userId - ID del usuario
     * @returns Una promesa que resuelve a true si la eliminación fue exitosa
     */
    deleteUserProfile: async (userId: string) => {
        try {
            const userRepository = repositoryFactory.getUserRepository();
            return await userRepository.delete(userId, userId);
        } catch (error) {
            console.error('Error al eliminar el perfil de usuario:', error);
            throw error;
        }
    },

    /**
     * Obtiene las estadísticas de un usuario
     * @param userId - ID del usuario
     * @returns Una promesa que resuelve a las estadísticas del usuario o null si no existen
     */
    getUserStats: async (userId: string) => {
        try {
            // TODO: Implementar repositorio de estadísticas del usuario
            // Por ahora, devolvemos null
            return null;
        } catch (error) {
            console.error('Error al obtener estadísticas del usuario:', error);
            return null;
        }
    }
};
