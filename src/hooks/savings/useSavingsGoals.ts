import { useState, useEffect, useCallback } from 'react';
import { savingsGoalServiceRepo } from '../../services/savings/savingsGoalServiceRepo';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

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
            
            const unsubscribe = savingsGoalServiceRepo.onSavingsGoalsUpdate(userId, (data: SavingsGoal[]) => {
                setSavingsGoals(data);
                stopLoading();
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error setting up savings goals subscription:', error);
            stopLoading();
        }
    }, [userId, startLoading, stopLoading, clearError]);

    const addSavingsGoal = useCallback(async (data: SavingsGoalFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => savingsGoalServiceRepo.addSavingsGoal(userId, data),
            'Error al agregar la meta de ahorro'
        );
    }, [userId]);

    const deleteSavingsGoal = useCallback(async (goalId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => savingsGoalServiceRepo.deleteSavingsGoal(userId, goalId),
            'Error al eliminar la meta de ahorro'
        );
    }, [userId]);

    const addAmountToGoal = useCallback(async (goalId: string, amount: number) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        if (amount <= 0) {
            return { success: false, error: 'El monto debe ser mayor a 0' };
        }

        return await handleAsyncOperation(
            () => savingsGoalServiceRepo.updateSavingsGoalAmount(userId, goalId, amount),
            'Error al agregar monto a la meta'
        );
    }, [userId]);

    const subtractAmountFromGoal = useCallback(async (goalId: string, amount: number) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        if (amount <= 0) {
            return { success: false, error: 'El monto debe ser mayor a 0' };
        }

        return await handleAsyncOperation(
            () => savingsGoalServiceRepo.updateSavingsGoalAmount(userId, goalId, -amount),
            'Error al restar monto de la meta'
        );
    }, [userId]);

    const clearSavingsGoalsError = useCallback(() => {
        clearError();
    }, [clearError]);

    return {
        savingsGoals,
        loadingSavingsGoals,
        savingsGoalsError,
        clearSavingsGoalsError,
        addSavingsGoal,
        deleteSavingsGoal,
        addAmountToGoal,
        subtractAmountFromGoal
    };
};