import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, writeBatch, getDocs, updateDoc, type Unsubscribe,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import type { Category, SubCategory } from '../types';
import { FIRESTORE_PATHS, defaultCategoriesStructure } from '../constants';
import { nanoid } from 'nanoid';

/**
 * Obtiene la referencia a la colección de categorías de un usuario específico.
 * @param userId - El ID del usuario.
 * @returns Una referencia a la colección de Firestore.
 */
const getCategoriesCollectionRef = (userId: string) => 
    collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.CATEGORIES);

// --- Objeto del Servicio ---

export const categoryService = {
    /**
     * Crea las categorías por defecto para un usuario nuevo si no tiene ninguna.
     */
    initializeDefaultCategories: async (userId: string): Promise<boolean> => {
        const categoriesRef = getCategoriesCollectionRef(userId);
        const existingCategories = await getDocs(query(categoriesRef));
        
        if (existingCategories.empty) {
            const batch = writeBatch(db);
            defaultCategoriesStructure.forEach(category => {
                const categoryDocRef = doc(categoriesRef);
                const subcategories: SubCategory[] = category.subcategories.map(subName => ({
                    id: nanoid(10), // Usamos nanoid para generar IDs consistentes y únicos
                    name: subName
                }));

                batch.set(categoryDocRef, { 
                    name: category.name, 
                    isDefault: true,
                    icon: category.icon,
                    color: category.color,
                    subcategories: subcategories
                });
            });
            await batch.commit();
            return true; 
        }
        return false; 
    },

    /**
     * Se suscribe a los cambios en las categorías de un usuario y ejecuta un callback.
     */
    onCategoriesUpdate: (userId: string, callback: (data: Category[]) => void): Unsubscribe => {
        const q = query(getCategoriesCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const categories = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
                subcategories: doc.data().subcategories || [] 
            } as Category));
            
            callback(categories.sort((a, b) => a.name.localeCompare(b.name)));
        });
    },

    /**
     * Añade una nueva categoría para un usuario.
     */
    addCategory: (userId: string, categoryName: string) => {
        return addDoc(getCategoriesCollectionRef(userId), { 
            name: categoryName, 
            isDefault: false,
            subcategories: [],
            icon: 'Tag', // Icono por defecto
            color: '#607D8B' // Color por defecto
        });
    },

    /**
     * Elimina una categoría por su ID.
     */
    deleteCategory: (userId: string, categoryId: string) => {
        return deleteDoc(doc(getCategoriesCollectionRef(userId), categoryId));
    },

    /**
     * Añade una nueva subcategoría a una categoría existente.
     */
    addSubCategory: (userId: string, categoryId: string, subCategoryName: string) => {
        const categoryDocRef = doc(getCategoriesCollectionRef(userId), categoryId);
        const newSubCategory: SubCategory = {
            id: nanoid(10),
            name: subCategoryName
        };
        return updateDoc(categoryDocRef, {
            subcategories: arrayUnion(newSubCategory)
        });
    },

    /**
     * CORRECCIÓN: La firma de la función ahora es más simple.
     * Solo necesita el objeto completo de la subcategoría a eliminar.
     */
    deleteSubCategory: (userId: string, categoryId: string, subCategoryToDelete: SubCategory) => {
        const categoryDocRef = doc(getCategoriesCollectionRef(userId), categoryId);
        return updateDoc(categoryDocRef, {
            subcategories: arrayRemove(subCategoryToDelete)
        });
    },

    /**
     * Actualiza el presupuesto de una categoría.
     */
    updateCategoryBudget: (userId: string, categoryId: string, budget: number) => {
        const categoryDocRef = doc(getCategoriesCollectionRef(userId), categoryId);
        return updateDoc(categoryDocRef, { budget });
    },

    /**
     * Actualiza el estilo (icono y color) de una categoría.
     */
    updateCategoryStyle: (userId: string, categoryId: string, style: { icon: string; color: string }) => {
        const categoryDocRef = doc(getCategoriesCollectionRef(userId), categoryId);
        return updateDoc(categoryDocRef, {
            icon: style.icon,
            color: style.color
        });
    },
};
