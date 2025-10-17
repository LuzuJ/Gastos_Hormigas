import { useState, useEffect, useCallback } from 'react';
import { userServiceRepo } from '../../services/profile/userServiceRepo';
import { auth } from '../../config/firebase';
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
            if (!userProfile && auth.currentUser) {
                // Adaptar el usuario de Firebase al formato que espera Supabase
                const supabaseUserFormat = {
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email || '',
                    user_metadata: {
                        display_name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Usuario'
                    }
                };
                await userServiceRepo.createUserProfile(supabaseUserFormat as any);
                userProfile = await userServiceRepo.getUserProfile(id);
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
