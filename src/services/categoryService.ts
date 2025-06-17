import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, type QuerySnapshot, type DocumentData,
    writeBatch, getDocs
} from 'firebase/firestore';
import type { Category } from '../types';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type CategoriesCallback = (data: Category[], error?: Error) => void;

const getCategoriesCollectionRef = (userId: string) => {
    return collection(db, `artifacts/${appId}/users/${userId}/categories`);
};

const defaultCategories = [
    { name: 'Alimento', isDefault: true }, { name: 'Transporte', isDefault: true },
    { name: 'Entretenimiento', isDefault: true }, { name: 'Hogar', isDefault: true },
    { name: 'Salud', isDefault: true }, { name: 'Otro', isDefault: true }
];

export const categoryService = {
    // Función para crear las categorías por defecto para un nuevo usuario
    initializeDefaultCategories: async (userId: string) => {
        const categoriesRef = getCategoriesCollectionRef(userId);
        // Comprobamos si la colección ya tiene documentos para no volver a crearlos
        const existingCategories = await getDocs(query(categoriesRef));
        if (existingCategories.empty) {
            const batch = writeBatch(db);
            defaultCategories.forEach(category => {
                const newCategoryRef = doc(categoriesRef);
                batch.set(newCategoryRef, category);
            });
            await batch.commit();
            console.log("Categorías por defecto inicializadas para el usuario:", userId);
        }
    },
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