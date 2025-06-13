// src/services/expensesService.js
import { db, appId } from '../config/firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    query,
    serverTimestamp
} from 'firebase/firestore';

export const expensesService = {
    onExpensesUpdate: (userId, callback) => {
        const expensesColRef = collection(db, `artifacts/${appId}/users/${userId}/expenses`);
        const q = query(expensesColRef);
        
        return onSnapshot(q, (snapshot) => {
            const fetchedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetchedExpenses.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            callback(fetchedExpenses);
        }, (error) => {
            console.error("Error al escuchar los gastos:", error);
            callback(null, error);
        });
    },

    addExpense: (userId, expenseData) => {
        const expensesColRef = collection(db, `artifacts/${appId}/users/${userId}/expenses`);
        return addDoc(expensesColRef, { ...expenseData, createdAt: serverTimestamp() });
    },

    deleteExpense: (userId, expenseId) => {
        const expenseDocRef = doc(db, `artifacts/${appId}/users/${userId}/expenses`, expenseId);
        return deleteDoc(expenseDocRef);
    }
};