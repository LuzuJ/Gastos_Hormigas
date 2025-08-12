import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc, type DocumentData } from 'firebase/firestore';
import type { Financials } from '../types';
import { FIRESTORE_PATHS } from '../constants'; // 1. Importamos las constantes

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type FinancialsCallback = (data: Financials | null, error?: Error) => void;

// 2. Usamos las constantes para la ruta del documento
const getFinancialsDocRef = (userId: string) => {
    return doc(db, FIRESTORE_PATHS.ARTIFACTS, appId, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.FINANCIALS, FIRESTORE_PATHS.FINANCIALS_SUMMARY_DOC);
};

export const financialsService = {
    onFinancialsUpdate: (userId: string, callback: FinancialsCallback) => {
        const financialsDocRef = getFinancialsDocRef(userId);
        return onSnapshot(financialsDocRef, (snapshot: DocumentData) => {
            if (snapshot.exists()) {
                callback(snapshot.data() as Financials);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Error fetching financials:", error);
            callback(null, error);
        });
    },

    setMonthlyIncome: (userId: string, income: number) => {
        const financialsDocRef = getFinancialsDocRef(userId);
        return setDoc(financialsDocRef, { monthlyIncome: income }, { merge: true });
    },
};