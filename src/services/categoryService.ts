import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, writeBatch, getDocs, updateDoc, type DocumentData, type Unsubscribe,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import type { Category, SubCategory } from '../types';
import { FIRESTORE_PATHS } from '../constants';
import { nanoid } from 'nanoid'; 

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type CategoriesCallback = (data: Category[]) => void;

const getCategoriesCollectionRef = (userId: string) => 
    collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.CATEGORIES);

const getSubCategoriesCollectionRef = (userId: string, categoryId: string) => 
    collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.CATEGORIES, categoryId, FIRESTORE_PATHS.SUBCATEGORIES);

// Definimos las categorías y subcategorías que se crearán para nuevos usuarios
const defaultCategoriesStructure = [
    { name: 'Alimento', subcategories: ['Supermercado', 'Restaurante', 'Delivery'] },
    { name: 'Transporte', subcategories: ['Gasolina', 'Transporte Público', 'Taxi/Uber'] },
    { name: 'Hogar', subcategories: ['Servicios (Luz, Agua)', 'Decoración', 'Reparaciones'] },
    { name: 'Entretenimiento', subcategories: ['Suscripciones', 'Cine', 'Salidas'] },
    { name: 'Salud', subcategories: ['Farmacia', 'Consulta Médica'] },
    { name: 'Otro', subcategories: ['General'] }
];

export const categoryService = {
    initializeDefaultCategories: async (userId: string): Promise<boolean> => {
        const categoriesRef = getCategoriesCollectionRef(userId);
        const q = query(categoriesRef);
        const existingCategories = await getDocs(q);
        
        if (existingCategories.empty) {
            const batch = writeBatch(db);
            defaultCategoriesStructure.forEach(category => {
                const categoryDocRef = doc(categoriesRef);
                batch.set(categoryDocRef, {
                    name: category.name,
                    isDefault: true,
                    subcategories: category.subcategories.map(subName => ({
                        id: nanoid(10), 
                        name: subName
                    }))
                });
            });
            await batch.commit();
            console.log("Categorías por defecto inicializadas para el usuario:", userId);
            return true;
        }
        return false;
    },
    onCategoriesUpdate: (userId: string, callback: CategoriesCallback): Unsubscribe => {
        const q = query(getCategoriesCollectionRef(userId));
        return onSnapshot(q, (snapshot: DocumentData) => {
            const categories = snapshot.docs.map((doc: DocumentData) => ({
                ...doc.data(),
                id: doc.id,
                subcategories: doc.data().subcategories || [] 
            } as Category));
            
            callback(categories.sort((a: Category, b: Category) => a.name.localeCompare(b.name)));
        });
    },
     updateCategoryBudget: (userId: string, categoryId: string, budget: number) => {
        const categoryDocRef = doc(getCategoriesCollectionRef(userId), categoryId);
        return updateDoc(categoryDocRef, { budget });
    },

    addCategory: (userId: string, categoryName: string) => {
        return addDoc(getCategoriesCollectionRef(userId), {
            name: categoryName,
            isDefault: false,
            subcategories: [] 
        });
    },
    deleteCategory: (userId: string, categoryId: string) => {
        return deleteDoc(doc(getCategoriesCollectionRef(userId), categoryId));
    },
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
    deleteSubCategory: (userId: string, categoryId: string, subCategoryId: string, subCategoryName: string) => {
        const categoryDocRef = doc(getCategoriesCollectionRef(userId), categoryId);
        return updateDoc(categoryDocRef, {
            subcategories: arrayRemove({ id: subCategoryId, name: subCategoryName })
        });
    }
};
