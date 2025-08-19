import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { auth } from '../config/firebase';
import { useLoadingState, handleAsyncOperation } from './useLoadingState';
import type { UserProfile } from '../types';

export const useUserProfile = (userId: string | null) => {
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
            let userProfile = await userService.getUserProfile(id);
            
            // Si el perfil no existe, crearlo automáticamente
            if (!userProfile && auth.currentUser) {
                await userService.createUserProfile(auth.currentUser);
                userProfile = await userService.getUserProfile(id);
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
                await userService.updateUserProfile(userId, data);
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