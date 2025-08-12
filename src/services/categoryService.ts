import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, writeBatch, getDocs, updateDoc, type DocumentData, type Unsubscribe
} from 'firebase/firestore';
import type { Category, SubCategory } from '../types';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type CategoriesCallback = (data: Category[]) => void;

const getCategoriesCollectionRef = (userId: string) => collection(db, `artifacts/${appId}/users/${userId}/categories`);
const getSubCategoriesCollectionRef = (userId: string, categoryId: string) => collection(db, `artifacts/${appId}/users/${userId}/categories/${categoryId}/subcategories`);

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
        const existingCategories = await getDocs(query(categoriesRef));
        
        if (existingCategories.empty) {
            const batch = writeBatch(db);
            for (const category of defaultCategoriesStructure) {
                const categoryDocRef = doc(categoriesRef);
                batch.set(categoryDocRef, { name: category.name, isDefault: true });
                for (const sub of category.subcategories) {
                    const subCategoryDocRef = doc(collection(db, categoryDocRef.path, 'subcategories'));
                    batch.set(subCategoryDocRef, { name: sub });
                }
            }
            await batch.commit();
            console.log("Categorías por defecto inicializadas para el usuario:", userId);
            return true; 
        }
        return false; 
    },
    onCategoriesUpdate: (userId: string, callback: CategoriesCallback): Unsubscribe => {
        const q = query(getCategoriesCollectionRef(userId));
        return onSnapshot(q, async (snapshot: DocumentData) => {
            const categoriesWithSubcategories: Category[] = [];
            for (const doc of snapshot.docs) {
                const categoryData = { ...doc.data(), id: doc.id, subcategories: [] } as Category;
                const subcategoriesQuery = query(getSubCategoriesCollectionRef(userId, doc.id));
                const subcategoriesSnapshot = await getDocs(subcategoriesQuery);
                categoryData.subcategories = subcategoriesSnapshot.docs.map(subDoc => ({ ...subDoc.data(), id: subDoc.id } as SubCategory));
                categoriesWithSubcategories.push(categoryData);
            }
            callback(categoriesWithSubcategories.sort((a, b) => a.name.localeCompare(b.name)));
        });
    },
    updateCategoryBudget: (userId: string, categoryId: string, budget: number) => {
        const categoryDocRef = doc(getCategoriesCollectionRef(userId), categoryId);
        // Usamos updateDoc para añadir o modificar el campo 'budget'
        return updateDoc(categoryDocRef, {
            budget: budget
        });
    },

    addCategory: (userId: string, categoryName: string) => {
        return addDoc(getCategoriesCollectionRef(userId), { name: categoryName, isDefault: false }); // Las creadas por el usuario no son por defecto
    },
    deleteCategory: (userId: string, categoryId: string) => {
        return deleteDoc(doc(getCategoriesCollectionRef(userId), categoryId));
    },
    addSubCategory: (userId: string, categoryId: string, subCategoryName: string) => {
        return addDoc(getSubCategoriesCollectionRef(userId, categoryId), { name: subCategoryName });
    },
    deleteSubCategory: (userId: string, categoryId: string, subCategoryId: string) => {
        const subCategoryDocRef = doc(db, `artifacts/${appId}/users/${userId}/categories/${categoryId}/subcategories/${subCategoryId}`);
        return deleteDoc(subCategoryDocRef);
    }
};
