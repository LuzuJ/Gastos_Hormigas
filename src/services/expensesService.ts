import { db } from '../config/firebase';
import {
    collection, addDoc, onSnapshot, doc,
    deleteDoc, query, serverTimestamp, updateDoc,
    type QuerySnapshot, type DocumentData
} from 'firebase/firestore';
import type { Expense, ExpenseFormData } from '../types';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type ExpensesCallback = (data: Expense[], error?: Error) => void;

const getExpensesCollectionRef = (userId: string) => {
    return collection(db, `artifacts/${appId}/users/${userId}/expenses`);
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
    addExpense: (userId: string, expenseData: ExpenseFormData) => {
        return addDoc(getExpensesCollectionRef(userId), { ...expenseData, createdAt: serverTimestamp() });
    },
    updateExpense: (userId: string, expenseId: string, expenseData: Partial<ExpenseFormData>) => {
        const expenseDocRef = doc(db, `artifacts/${appId}/users/${userId}/expenses`, expenseId);
        return updateDoc(expenseDocRef, expenseData);
    },
    deleteExpense: (userId: string, expenseId: string) => {
        const expenseDocRef = doc(db, `artifacts/${appId}/users/${userId}/expenses`, expenseId);
        return deleteDoc(expenseDocRef);
    }
};