import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, type QuerySnapshot, type DocumentData
} from 'firebase/firestore';
import type { FixedExpense } from '../types';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type FixedExpensesCallback = (data: FixedExpense[], error?: Error) => void;

const getFixedExpensesCollectionRef = (userId: string) => {
    return collection(db, `artifacts/${appId}/users/${userId}/fixedExpenses`);
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
        const fixedExpenseDocRef = doc(db, `artifacts/${appId}/users/${userId}/fixedExpenses`, fixedExpenseId);
        return deleteDoc(fixedExpenseDocRef);
    },
};
