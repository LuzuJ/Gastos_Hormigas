import { useState, useEffect, useCallback } from 'react';
import { savingsGoalService } from '../services/savingsGoalService';
import { db } from '../config/firebase'; // Necesitamos la referencia a la DB
import { doc, runTransaction, increment } from 'firebase/firestore';
import type { SavingsGoal, SavingsGoalFormData } from '../types';
import { FIRESTORE_PATHS } from '../constants';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';

export const useSavingsGoals = (userId: string | null) => {
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setSavingsGoals([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = savingsGoalService.onSavingsGoalsUpdate(userId, (data) => {
            setSavingsGoals(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const addSavingsGoal = useCallback(async (data: SavingsGoalFormData) => {
        if (!userId) return { success: false, error: 'Usuario no autenticado.' };
        try {
            await savingsGoalService.addSavingsGoal(userId, data);
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: "Ocurrió un error al crear la meta." };
        }
    }, [userId]);

    const deleteSavingsGoal = useCallback(async (goalId: string) => {
        if (!userId) return;
        await savingsGoalService.deleteSavingsGoal(userId, goalId);
    }, [userId]);

    const addToSavingsGoal = useCallback(async (goalId: string, amount: number) => {
        if (!userId || amount <= 0) return { success: false, error: 'Monto inválido o usuario no autenticado.' };
        
        const goalDocRef = doc(db, FIRESTORE_PATHS.ARTIFACTS, appId, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.SAVINGS_GOALS, goalId);

        try {
            // Usamos una transacción para asegurar que la actualización sea atómica
            await runTransaction(db, async (transaction) => {
                const goalDoc = await transaction.get(goalDocRef);
                if (!goalDoc.exists()) {
                    throw new Error("¡La meta ya no existe!");
                }
                
                const newAmount = goalDoc.data().currentAmount + amount;
                if (newAmount > goalDoc.data().targetAmount) {
                   // Opcional: podrías decidir si permitir exceder la meta o no
                }

                transaction.update(goalDocRef, { currentAmount: increment(amount) });
            });
            return { success: true };
        } catch (err) {
            console.error("Error al añadir a la meta de ahorro:", err);
            return { success: false, error: 'No se pudo actualizar la meta.' };
        }
    }, [userId]);

    return {
        savingsGoals,
        loadingSavingsGoals: loading,
        addSavingsGoal,
        deleteSavingsGoal,
        addToSavingsGoal,
    };
};