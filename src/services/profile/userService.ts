import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FIRESTORE_PATHS } from '../../constants';
import type { UserProfile } from '../../types';
import type { User } from 'firebase/auth';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';

const getUserDocRef = (userId: string) => {
    return doc(db, FIRESTORE_PATHS.USERS, userId);
};

export const userService = {
    // Crea el perfil inicial de un usuario
    createUserProfile: async (user: User) => {
        const userDocRef = getUserDocRef(user.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                const profileData = {
                    displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
                    email: user.email || '',
                    currency: 'USD' as const,
                };
                await setDoc(userDocRef, profileData);
            }
        } catch (error) {
            console.error('Error al crear el perfil de usuario:', error);
            throw error;
        }
    },

    // Obtiene el perfil de un usuario
    getUserProfile: async (userId: string): Promise<UserProfile | null> => {
        try {
            const userDoc = await getDoc(getUserDocRef(userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                // Asegurar que el perfil tenga todos los campos requeridos
                return {
                    displayName: data.displayName || 'Usuario',
                    email: data.email || '',
                    currency: data.currency || 'USD',
                } as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener el perfil de usuario:', error);
            return null;
        }
    },

    // Actualiza el perfil de un usuario
    updateUserProfile: (userId: string, data: Partial<UserProfile>) => {
        return updateDoc(getUserDocRef(userId), data);
    }
};