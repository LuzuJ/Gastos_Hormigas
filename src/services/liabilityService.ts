import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query
} from 'firebase/firestore';
import type { Liability, LiabilityFormData } from '../types';
import { FIRESTORE_PATHS } from '../constants';

type LiabilitiesCallback = (data: Liability[]) => void;

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
        return addDoc(getLiabilitiesCollectionRef(userId), data);
    },

    updateLiability: (userId: string, liabilityId: string, data: Partial<LiabilityFormData>) => {
        const liabilityDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.LIABILITIES, liabilityId);
        return updateDoc(liabilityDocRef, data);
    },

    deleteLiability: (userId: string, liabilityId: string) => {
        const liabilityDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.LIABILITIES, liabilityId);
        return deleteDoc(liabilityDocRef);
    },
};