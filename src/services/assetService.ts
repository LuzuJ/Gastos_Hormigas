import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query
} from 'firebase/firestore';
import type { Asset, AssetFormData } from '../types';
import { FIRESTORE_PATHS } from '../constants';

type AssetsCallback = (data: Asset[]) => void;

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
        return addDoc(getAssetsCollectionRef(userId), data);
    },

    updateAsset: (userId: string, assetId: string, data: Partial<AssetFormData>) => {
        const assetDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.ASSETS, assetId);
        return updateDoc(assetDocRef, data);
    },

    deleteAsset: (userId: string, assetId: string) => {
        const assetDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.ASSETS, assetId);
        return deleteDoc(assetDocRef);
    },
};