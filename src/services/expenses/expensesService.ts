import { db } from '../../config/firebase';
import {
    collection, addDoc, onSnapshot, doc,
    deleteDoc, query, serverTimestamp, updateDoc,
    type QuerySnapshot, type DocumentData, Timestamp
} from 'firebase/firestore';
import type { Expense, ExpenseFormData } from '../../types';
import { FIRESTORE_PATHS } from '../../constants-legacy'; // 1. Importamos las constantes

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type ExpensesCallback = (data: Expense[], error?: Error) => void;

// 2. Usamos las constantes para construir la ruta
const getExpensesCollectionRef = (userId: string) => {
    return collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.EXPENSES);
};

export const expensesService = {
    onExpensesUpdate: (userId: string, callback: ExpensesCallback) => {
        const q = query(getExpensesCollectionRef(userId));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const expenses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Expense));
            expenses.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
            callback(expenses);
        }, (error) => {
            console.error("Error fetching expenses:", error);
            callback([], error);
        });
    },
    addExpense: (userId: string, expenseData: ExpenseFormData, expenseDate?: Timestamp) => {
        return addDoc(getExpensesCollectionRef(userId), { 
            ...expenseData, 
            createdAt: expenseDate || serverTimestamp() 
        });
    },
    updateExpense: (userId: string, expenseId: string, expenseData: Partial<ExpenseFormData>) => {
        // 3. También las usamos para obtener la referencia a un documento específico
        const expenseDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.EXPENSES, expenseId);
        return updateDoc(expenseDocRef, expenseData);
    },
    deleteExpense: (userId: string, expenseId: string) => {
        const expenseDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.EXPENSES, expenseId);
        return deleteDoc(expenseDocRef);
    }
};