import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    query,
    serverTimestamp,
    QuerySnapshot,
    DocumentData,
} from 'firebase/firestore';
import type { Expense } from '../types';

// El ID de tu aplicación o un identificador único.
// Podrías moverlo a .env si planeas tener múltiples instancias.
const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';

type ExpensesCallback = (data: Expense[], error?: Error) => void;

const getExpensesCollectionRef = (userId: string) => {
    return collection(db, `artifacts/${appId}/users/${userId}/expenses`);
};

export const expensesService = {
    onExpensesUpdate: (userId: string, callback: ExpensesCallback) => {
        const expensesColRef = getExpensesCollectionRef(userId);
        const q = query(expensesColRef);
        
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const fetchedExpenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Expense));
            
            fetchedExpenses.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
            
            callback(fetchedExpenses);
        }, (error) => {
            console.error("Error al escuchar los gastos:", error);
            callback([], error);
        });
    },

    addExpense: (userId: string, expenseData: { description: string; amount: number; category: string; }) => {
        const expensesColRef = getExpensesCollectionRef(userId);
        return addDoc(expensesColRef, { ...expenseData, createdAt: serverTimestamp() });
    },

    deleteExpense: (userId: string, expenseId: string) => {
        const expenseDocRef = doc(db, `artifacts/${appId}/users/${userId}/expenses`, expenseId);
        return deleteDoc(expenseDocRef);
    }
};