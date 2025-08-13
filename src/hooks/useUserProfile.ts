import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { UserProfile } from '../types';

export const useUserProfile = (userId: string | null) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (id: string) => {
        setLoading(true);
        const userProfile = await userService.getUserProfile(id);
        setProfile(userProfile);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (userId) {
            fetchProfile(userId);
        } else {
            setProfile(null);
            setLoading(false);
        }
    }, [userId, fetchProfile]);

    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!userId) return;
        await userService.updateUserProfile(userId, data);
        await fetchProfile(userId); // Vuelve a cargar el perfil para reflejar los cambios
    };

    return { profile, loadingProfile: loading, updateUserProfile };
};