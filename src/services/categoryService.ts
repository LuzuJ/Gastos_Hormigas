import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, type QuerySnapshot, type DocumentData
} from 'firebase/firestore';
import type { Category } from '../types';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type CategoriesCallback = (data: Category[], error?: Error) => void;

const getCategoriesCollectionRef = (userId: string) => {
    return collection(db, `artifacts/${appId}/users/${userId}/categories`);
};

export const categoryService = {
    onCategoriesUpdate: (userId: string, callback: CategoriesCallback) => {
        const q = query(getCategoriesCollectionRef(userId));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const categories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
            callback(categories.sort((a, b) => a.name.localeCompare(b.name)));
        }, (error) => {
            console.error("Error fetching categories:", error);
            callback([], error);
        });
    },
    addCategory: (userId: string, categoryName: string) => {
        return addDoc(getCategoriesCollectionRef(userId), { name: categoryName });
    },
    deleteCategory: (userId: string, categoryId: string) => {
        const categoryDocRef = doc(db, `artifacts/${appId}/users/${userId}/categories`, categoryId);
        return deleteDoc(categoryDocRef);
    },
};