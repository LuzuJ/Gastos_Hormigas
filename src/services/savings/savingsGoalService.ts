import { repositoryFactory } from '../../repositories';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

// Tipo para mantener compatibilidad con código existente
type SavingsGoalsCallback = (data: SavingsGoal[], error?: Error) => void;

/**
 * Servicio para la gestión de metas de ahorro
 * @deprecated Favor de utilizar savingsGoalServiceRepo.ts que implementa el patrón repositorio
 */
export const savingsGoalService = {
    onSavingsGoalsUpdate: (userId: string, callback: SavingsGoalsCallback) => {
        try {
            // Este servicio está siendo migrado al patrón repositorio
            // Se recomienda usar savingsGoalServiceRepo.onSavingsGoalsUpdate en su lugar
            return repositoryFactory.getSavingsGoalRepository().subscribeToSavingsGoals(
                userId, 
                (goals) => callback(goals)
            );
        } catch (error) {
            console.error("Error fetching savings goals:", error);
            callback([], error instanceof Error ? error : new Error(String(error)));
            // Devolver función noop para mantener la compatibilidad
            return () => {};
        }
    },

    addSavingsGoal: async (userId: string, goalData: SavingsGoalFormData) => {
        // Este servicio está siendo migrado al patrón repositorio
        // Se recomienda usar savingsGoalServiceRepo.addSavingsGoal en su lugar
        try {
            await repositoryFactory.getSavingsGoalRepository().addSavingsGoal(userId, goalData);
            // La API original retornaba una promesa pero no un valor específico
            return { id: 'created' }; // Simular el retorno de un DocumentReference
        } catch (error) {
            console.error("Error adding savings goal:", error);
            throw error;
        }
    },

    deleteSavingsGoal: async (userId: string, goalId: string) => {
        // Este servicio está siendo migrado al patrón repositorio
        // Se recomienda usar savingsGoalServiceRepo.deleteSavingsGoal en su lugar
        try {
            await repositoryFactory.getSavingsGoalRepository().deleteSavingsGoal(userId, goalId);
            // La API original retornaba una promesa pero no un valor específico
            return true;
        } catch (error) {
            console.error("Error deleting savings goal:", error);
            throw error;
        }
    },
};