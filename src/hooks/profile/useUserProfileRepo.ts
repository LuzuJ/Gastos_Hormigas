import { useState, useEffect, useCallback } from 'react';
import { userServiceRepo } from '../../services/profile/userServiceRepo';
import { supabase } from '../../config/supabase';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { UserProfile } from '../../types';

/**
 * Hook personalizado para la gestión del perfil de usuario utilizando el patrón repositorio
 * @param userId - ID del usuario
 * @returns Estado y funciones para gestionar el perfil de usuario
 */
export const useUserProfileRepo = (userId: string | null) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const { 
        loading: loadingProfile, 
        error: profileError, 
        startLoading, 
        stopLoading, 
        setErrorState, 
        clearError 
    } = useLoadingState(true);

    const fetchProfile = useCallback(async (id: string) => {
        startLoading();
        clearError();
        
        try {
            let userProfile = await userServiceRepo.getUserProfile(id);
            
            // Si el perfil no existe, crearlo automáticamente
            if (!userProfile) {
                // Obtener el usuario actual de Supabase
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    // El trigger handle_new_user ya debería haber creado el perfil
                    // Si no existe, intentar obtenerlo nuevamente
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar un momento
                    userProfile = await userServiceRepo.getUserProfile(id);
                    
                    // Si aún no existe después de esperar, hay un problema
                    if (!userProfile) {
                        console.error('El perfil no se creó automáticamente. El trigger handle_new_user podría no estar funcionando.');
                    }
                }
            }
            
            setProfile(userProfile);
            stopLoading();
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
            setErrorState(error instanceof Error ? error.message : 'Error al cargar el perfil');
            setProfile(null);
        }
    }, [startLoading, stopLoading, setErrorState, clearError]);

    useEffect(() => {
        if (userId) {
            fetchProfile(userId);
        } else {
            setProfile(null);
            stopLoading();
        }
    }, [userId, fetchProfile, stopLoading]);

    const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            async () => {
                await userServiceRepo.updateUserProfile(userId, data);
                await fetchProfile(userId); // Vuelve a cargar el perfil para reflejar los cambios
            },
            'Error al actualizar el perfil'
        );
    }, [userId, fetchProfile]);

    return { 
        profile, 
        loadingProfile, 
        profileError, 
        clearProfileError: clearError,
        updateUserProfile 
    };
};
