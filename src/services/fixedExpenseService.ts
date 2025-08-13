import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, type QuerySnapshot, type DocumentData, 
    updateDoc, getDocs
} from 'firebase/firestore';
import type { FixedExpense } from '../types';
import { FIRESTORE_PATHS } from '../constants'; // 1. Importamos las constantes

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type FixedExpensesCallback = (data: FixedExpense[], error?: Error) => void;

// 2. Usamos las constantes para construir la ruta
const getFixedExpensesCollectionRef = (userId: string) => {
    return collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.FIXED_EXPENSES);
};

export const fixedExpenseService = {
    onFixedExpensesUpdate: (userId: string, callback: FixedExpensesCallback) => {
        const q = query(getFixedExpensesCollectionRef(userId));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const fixedExpenses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FixedExpense));
            callback(fixedExpenses.sort((a, b) => a.dayOfMonth - b.dayOfMonth));
        }, (error) => {
            console.error("Error fetching fixed expenses:", error);
            callback([], error);
        });
    },

    addFixedExpense: (userId: string, data: Omit<FixedExpense, 'id'>) => {
        return addDoc(getFixedExpensesCollectionRef(userId), data);
    },

    deleteFixedExpense: (userId: string, fixedExpenseId: string) => {
        // 3. Y finalmente aquí también
        const fixedExpenseDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.FIXED_EXPENSES, fixedExpenseId);
        return deleteDoc(fixedExpenseDocRef);
    },
    getFixedExpensesOnce: async (userId: string) => {
        const snapshot = await getDocs(getFixedExpensesCollectionRef(userId));
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FixedExpense));
    },

    // Actualiza un gasto fijo específico (para marcarlo como registrado)
    updateFixedExpense: (userId: string, goalId: string, data: Partial<FixedExpense>) => {
        const fixedExpenseDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.FIXED_EXPENSES, goalId);
        return updateDoc(fixedExpenseDocRef, data);
    }
};