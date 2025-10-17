import { repositoryFactory } from '../../repositories';
import type { UserProfile } from '../../types';
import type { User } from '@supabase/supabase-js';

/**
 * Servicio para la gestión de usuarios
 * 
 * @deprecated Favor de utilizar userServiceRepo.ts que implementa el patrón repositorio
 */
export const userService = {
    // Crea el perfil inicial de un usuario
    createUserProfile: async (user: User) => {
        try {
            // Este servicio está siendo migrado al patrón repositorio
            // Se recomienda usar userServiceRepo.createUserProfile en su lugar
            return await repositoryFactory.getUserRepository().createUserProfile(user);
        } catch (error) {
            console.error('Error al crear el perfil de usuario:', error);
            throw error;
        }
    },

    // Obtiene el perfil de un usuario
    getUserProfile: async (userId: string): Promise<UserProfile | null> => {
        try {
            // Este servicio está siendo migrado al patrón repositorio
            // Se recomienda usar userServiceRepo.getUserProfile en su lugar
            return await repositoryFactory.getUserRepository().getUserProfile(userId);
        } catch (error) {
            console.error('Error al obtener el perfil de usuario:', error);
            return null;
        }
    },

    // Actualiza el perfil de un usuario
    updateUserProfile: async (userId: string, profileData: Partial<UserProfile>) => {
        try {
            // Este servicio está siendo migrado al patrón repositorio
            // Se recomienda usar userServiceRepo.updateUserProfile en su lugar
            await repositoryFactory.getUserRepository().update(userId, userId, profileData);
        } catch (error) {
            console.error('Error al actualizar el perfil de usuario:', error);
            throw error;
        }
    },

    // Función adicional: Eliminar perfil de usuario
    deleteUserProfile: async (userId: string) => {
        try {
            // Este servicio está siendo migrado al patrón repositorio
            // Se recomienda usar userServiceRepo.deleteUserProfile en su lugar
            await repositoryFactory.getUserRepository().delete(userId, userId);
        } catch (error) {
            console.error('Error al eliminar el perfil de usuario:', error);
            throw error;
        }
    },

    // Función adicional: Obtener estadísticas del usuario
    getUserStats: async (userId: string) => {
        try {
            // Ahora usamos el repositorio de estadísticas
            return await repositoryFactory.getUserStatsRepository().getUserStats(userId);
        } catch (error) {
            console.error('Error al obtener estadísticas del usuario:', error);
            return null;
        }
    }
};