import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FIRESTORE_PATHS } from '../constants';
import type { UserProfile } from '../types';
import type { User } from 'firebase/auth';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';

const getUserDocRef = (userId: string) => {
    return doc(db, FIRESTORE_PATHS.USERS, userId);
};

export const userService = {
    // Crea el perfil inicial de un usuario
    createUserProfile: async (user: User) => {
        const userDocRef = getUserDocRef(user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
                email: user.email,
                currency: 'USD',
            });
        }
    },

    // Obtiene el perfil de un usuario
    getUserProfile: async (userId: string): Promise<UserProfile | null> => {
        const userDoc = await getDoc(getUserDocRef(userId));
        return userDoc.exists() ? userDoc.data() as UserProfile : null;
    },

    // Actualiza el perfil de un usuario
    updateUserProfile: (userId: string, data: Partial<UserProfile>) => {
        return updateDoc(getUserDocRef(userId), data);
    }
};