import { db } from '../config/firebase';
import {
    collection, onSnapshot, addDoc, doc, deleteDoc,
    query, serverTimestamp, type QuerySnapshot, type DocumentData
} from 'firebase/firestore';
import type { SavingsGoal, SavingsGoalFormData } from '../types';
import { FIRESTORE_PATHS } from '../constants';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
type SavingsGoalsCallback = (data: SavingsGoal[], error?: Error) => void;

const getSavingsGoalsCollectionRef = (userId: string) => {
    return collection(db, FIRESTORE_PATHS.ARTIFACTS, appId, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.SAVINGS_GOALS);
};

export const savingsGoalService = {
    onSavingsGoalsUpdate: (userId: string, callback: SavingsGoalsCallback) => {
        const q = query(getSavingsGoalsCollectionRef(userId));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const goals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SavingsGoal));
            callback(goals);
        }, (error) => {
            console.error("Error fetching savings goals:", error);
            callback([], error);
        });
    },

    addSavingsGoal: (userId: string, goalData: SavingsGoalFormData) => {
        return addDoc(getSavingsGoalsCollectionRef(userId), {
            ...goalData,
            currentAmount: 0,
            createdAt: serverTimestamp()
        });
    },

    deleteSavingsGoal: (userId: string, goalId: string) => {
        const goalDocRef = doc(db, FIRESTORE_PATHS.ARTIFACTS, appId, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.SAVINGS_GOALS, goalId);
        return deleteDoc(goalDocRef);
    },
};