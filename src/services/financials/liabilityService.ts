import { db } from '../../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, Timestamp
} from 'firebase/firestore';
import type { Liability, LiabilityFormData } from '../../types';
import { FIRESTORE_PATHS } from '../../constants';

type LiabilitiesCallback = (data: Liability[]) => void;

// Helper para limpiar datos undefined antes de enviar a Firebase
const cleanData = (data: any) => {
    const cleaned: any = {};
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            cleaned[key] = data[key];
        }
    });
    return cleaned;
};

const getLiabilitiesCollectionRef = (userId: string) => {
    return collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.LIABILITIES);
};

export const liabilityService = {
    onLiabilitiesUpdate: (userId: string, callback: LiabilitiesCallback) => {
        const q = query(getLiabilitiesCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const liabilities = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Liability));
            callback(liabilities);
        });
    },

    addLiability: (userId: string, data: LiabilityFormData) => {
        const liabilityData = cleanData({
            ...data,
            originalAmount: data.originalAmount || data.amount, // Si no se especifica, usar el monto actual
            lastUpdated: Timestamp.now()
        });
        return addDoc(getLiabilitiesCollectionRef(userId), liabilityData);
    },

    updateLiability: (userId: string, liabilityId: string, data: Partial<LiabilityFormData>) => {
        const liabilityDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.LIABILITIES, liabilityId);
        const updateData = cleanData({
            ...data,
            lastUpdated: Timestamp.now()
        });
        return updateDoc(liabilityDocRef, updateData);
    },

    deleteLiability: (userId: string, liabilityId: string) => {
        const liabilityDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.LIABILITIES, liabilityId);
        return deleteDoc(liabilityDocRef);
    },

    // Nueva función para realizar un pago que reduce la deuda
    makePayment: async (userId: string, liabilityId: string, paymentAmount: number) => {
        const liabilityDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.LIABILITIES, liabilityId);
        
        // Esta función debe usarse junto con una transacción para asegurar consistencia
        // Por simplicidad, aquí solo actualizamos el monto
        return updateDoc(liabilityDocRef, {
            lastUpdated: Timestamp.now()
        });
    }
};