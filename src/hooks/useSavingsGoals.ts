import { useState, useEffect, useCallback } from 'react';
import { savingsGoalService } from '../services/savingsGoalService';
import { db } from '../config/firebase'; // Necesitamos la referencia a la DB
import { doc, runTransaction, increment } from 'firebase/firestore';
import { useLoadingState, handleAsyncOperation } from './useLoadingState';
import type { SavingsGoal, SavingsGoalFormData } from '../types';
import { FIRESTORE_PATHS } from '../constants';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';

export const useSavingsGoals = (userId: string | null) => {
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const { 
        loading: loadingSavingsGoals, 
        error: savingsGoalsError, 
        startLoading, 
        stopLoading, 
        clearError 
    } = useLoadingState(true);

    useEffect(() => {
        if (!userId) {
            setSavingsGoals([]);
            stopLoading();
            return;
        }

        try {
            startLoading();
            clearError();
            
            const unsubscribe = savingsGoalService.onSavingsGoalsUpdate(userId, (data) => {
                setSavingsGoals(data);
                stopLoading();
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Error en useSavingsGoals:', error);
            stopLoading();
            // No lanzar el error, solo registrarlo
            setSavingsGoals([]);
        }
    }, [userId, startLoading, stopLoading, clearError]);

    const addSavingsGoal = useCallback(async (data: SavingsGoalFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => savingsGoalService.addSavingsGoal(userId, data),
            'Error al crear la meta de ahorro'
        );
    }, [userId]);

    const deleteSavingsGoal = useCallback(async (goalId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => savingsGoalService.deleteSavingsGoal(userId, goalId),
            'Error al eliminar la meta de ahorro'
        );
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
        loadingSavingsGoals,
        savingsGoalsError,
        clearSavingsGoalsError: clearError,
        addSavingsGoal,
        deleteSavingsGoal,
        addToSavingsGoal,
        removeFromSavingsGoal,
    };
};