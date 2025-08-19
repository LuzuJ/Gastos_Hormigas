import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc, query, orderBy, where, Timestamp, updateDoc
} from 'firebase/firestore';
import type { DebtPayment } from '../types';
import { FIRESTORE_PATHS } from '../constants';

type DebtPaymentsCallback = (data: DebtPayment[]) => void;

const getDebtPaymentsCollectionRef = (userId: string) => {
    return collection(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.DEBT_PAYMENTS);
};

export interface DebtPaymentFormData {
    liabilityId: string;
    amount: number;
    description?: string;
    paymentType: 'regular' | 'extra' | 'interest_only';
}

export const debtPaymentService = {
    // Obtener todos los pagos de deuda de un usuario
    onDebtPaymentsUpdate: (userId: string, callback: DebtPaymentsCallback) => {
        const q = query(
            getDebtPaymentsCollectionRef(userId),
            orderBy('paymentDate', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const payments = snapshot.docs.map(doc => ({ 
                ...doc.data(), 
                id: doc.id 
            } as DebtPayment));
            callback(payments);
        });
    },

    // Obtener pagos de una deuda específica
    onLiabilityPaymentsUpdate: (userId: string, liabilityId: string, callback: DebtPaymentsCallback) => {
        const q = query(
            getDebtPaymentsCollectionRef(userId),
            where('liabilityId', '==', liabilityId),
            orderBy('paymentDate', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const payments = snapshot.docs.map(doc => ({ 
                ...doc.data(), 
                id: doc.id 
            } as DebtPayment));
            callback(payments);
        });
    },

    // Registrar un pago de deuda
    addDebtPayment: async (userId: string, data: DebtPaymentFormData) => {
        const paymentData = {
            ...data,
            paymentDate: Timestamp.now()
        };
        return addDoc(getDebtPaymentsCollectionRef(userId), paymentData);
    },

    // Eliminar un pago de deuda
    deleteDebtPayment: (userId: string, paymentId: string) => {
        const paymentDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.DEBT_PAYMENTS, paymentId);
        return deleteDoc(paymentDocRef);
    },

    // Actualizar un pago de deuda
    updateDebtPayment: (userId: string, paymentId: string, data: Partial<DebtPaymentFormData>) => {
        const paymentDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.DEBT_PAYMENTS, paymentId);
        return updateDoc(paymentDocRef, data);
    }
};
