import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, Timestamp
} from 'firebase/firestore';
import type { Asset, AssetFormData } from '../types';
import { FIRESTORE_PATHS } from '../constants';

type AssetsCallback = (data: Asset[]) => void;

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

const getAssetsCollectionRef = (userId: string) => {
    return collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.ASSETS);
};

export const assetService = {
    onAssetsUpdate: (userId: string, callback: AssetsCallback) => {
        const q = query(getAssetsCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const assets = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Asset));
            callback(assets);
        });
    },

    addAsset: (userId: string, data: AssetFormData) => {
        const assetData = cleanData({
            ...data,
            lastUpdated: Timestamp.now()
        });
        return addDoc(getAssetsCollectionRef(userId), assetData);
    },

    updateAsset: (userId: string, assetId: string, data: Partial<AssetFormData>) => {
        const assetDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.ASSETS, assetId);
        const updateData = cleanData({
            ...data,
            lastUpdated: Timestamp.now()
        });
        return updateDoc(assetDocRef, updateData);
    },

    deleteAsset: (userId: string, assetId: string) => {
        const assetDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.ASSETS, assetId);
        return deleteDoc(assetDocRef);
    },
};