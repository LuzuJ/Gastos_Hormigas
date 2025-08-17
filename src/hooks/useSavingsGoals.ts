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
        
        const goalDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.SAVINGS_GOALS, goalId);

        try {
            // Firestore maneja la lectura y escritura de forma segura dentro de la transacción
            await runTransaction(db, async (transaction) => {
                const goalDoc = await transaction.get(goalDocRef);
                if (!goalDoc.exists()) {
                    throw new Error("¡La meta ya no existe!");
                }
                
                // Usamos la función 'increment' de Firestore para una actualización atómica y segura.
                transaction.update(goalDocRef, { currentAmount: increment(amount) });
            });
            return { success: true };
        } catch (err) {
            console.error("Error al añadir a la meta de ahorro:", err);
            return { success: false, error: 'No se pudo actualizar la meta.' };
        }
    }, [userId]);

    const removeFromSavingsGoal = useCallback(async (goalId: string, amount: number) => {
        if (!userId || amount <= 0) return { success: false, error: 'Monto inválido o usuario no autenticado.' };
        
        const goalDocRef = doc(db, FIRESTORE_PATHS.USERS, userId, FIRESTORE_PATHS.SAVINGS_GOALS, goalId);

        try {
            await runTransaction(db, async (transaction) => {
                const goalDoc = await transaction.get(goalDocRef);
                if (!goalDoc.exists()) {
                    throw new Error("¡La meta ya no existe!");
                }

                const currentAmount = goalDoc.data().currentAmount;
                if (currentAmount < amount) {
                    throw new Error("No puedes quitar más dinero del que has ahorrado.");
                }
                
                // Usamos increment con un número negativo para restar
                transaction.update(goalDocRef, { currentAmount: increment(-amount) });
            });
            return { success: true };
        } catch (err: any) {
            console.error("Error al quitar fondos:", err);
            return { success: false, error: err.message || 'No se pudo actualizar la meta.' };
        }
    }, [userId]);

    return {
        savingsGoals,
        loadingSavingsGoals: loading,
        addSavingsGoal,
        deleteSavingsGoal,
        addToSavingsGoal,
        removeFromSavingsGoal,
    };
};