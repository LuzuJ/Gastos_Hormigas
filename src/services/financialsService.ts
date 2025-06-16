import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc, type DocumentData } from 'firebase/firestore';
import type { Financials } from '../types';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type FinancialsCallback = (data: Financials | null, error?: Error) => void;

// A diferencia de los gastos, solo tendremos UN documento para los datos financieros
const getFinancialsDocRef = (userId: string) => {
    return doc(db, `artifacts/${appId}/users/${userId}/financials`, 'summary');
};

export const financialsService = {
    onFinancialsUpdate: (userId: string, callback: FinancialsCallback) => {
        const financialsDocRef = getFinancialsDocRef(userId);
        return onSnapshot(financialsDocRef, (snapshot: DocumentData) => {
            if (snapshot.exists()) {
                callback(snapshot.data() as Financials);
            } else {
                // Si no existe, devuelve null para que la UI sepa que no hay datos
                callback(null);
            }
        }, (error) => {
            console.error("Error fetching financials:", error);
            callback(null, error);
        });
    },

    setMonthlyIncome: (userId: string, income: number) => {
        const financialsDocRef = getFinancialsDocRef(userId);
        // Usamos setDoc con { merge: true } para crear o actualizar el documento sin sobreescribir otros campos
        return setDoc(financialsDocRef, { monthlyIncome: income }, { merge: true });
    },
};
