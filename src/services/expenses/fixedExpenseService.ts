import { repositoryFactory } from '../../repositories';
import type { FixedExpense } from '../../types';

// Tipo para mantener compatibilidad con código existente
type FixedExpensesCallback = (data: FixedExpense[], error?: Error) => void;

/**
 * Servicio para la gestión de gastos fijos
 * @deprecated Favor de utilizar fixedExpenseServiceRepo.ts que implementa el patrón repositorio
 */
export const fixedExpenseService = {
    onFixedExpensesUpdate: (userId: string, callback: FixedExpensesCallback) => {
        try {
            // Este servicio está siendo migrado al patrón repositorio
            // Se recomienda usar fixedExpenseServiceRepo.onFixedExpensesUpdate en su lugar
            return repositoryFactory.getFixedExpenseRepository().subscribeToFixedExpenses(
                userId, 
                (fixedExpenses) => callback(
                    // Mantener el mismo ordenamiento que la versión original
                    fixedExpenses.sort((a, b) => a.dayOfMonth - b.dayOfMonth)
                )
            );
        } catch (error) {
            console.error("Error fetching fixed expenses:", error);
            callback([], error instanceof Error ? error : new Error(String(error)));
            // Devolver función noop para mantener la compatibilidad
            return () => {};
        }
    },

    addFixedExpense: async (userId: string, data: Omit<FixedExpense, 'id'>) => {
        // Este servicio está siendo migrado al patrón repositorio
        // Se recomienda usar fixedExpenseServiceRepo.addFixedExpense en su lugar
        try {
            await repositoryFactory.getFixedExpenseRepository().addFixedExpense(userId, data);
            // La API original retornaba una promesa pero no un valor específico
            return true;
        } catch (error) {
            console.error("Error adding fixed expense:", error);
            throw error;
        }
    },

    deleteFixedExpense: async (userId: string, fixedExpenseId: string) => {
        // Este servicio está siendo migrado al patrón repositorio
        // Se recomienda usar fixedExpenseServiceRepo.deleteFixedExpense en su lugar
        try {
            await repositoryFactory.getFixedExpenseRepository().deleteFixedExpense(userId, fixedExpenseId);
            // La API original retornaba una promesa pero no un valor específico
            return true;
        } catch (error) {
            console.error("Error deleting fixed expense:", error);
            throw error;
        }
    },
    
    getFixedExpensesOnce: async (userId: string) => {
        // Este servicio está siendo migrado al patrón repositorio
        // Se recomienda usar fixedExpenseServiceRepo.getFixedExpenses en su lugar
        try {
            return await repositoryFactory.getFixedExpenseRepository().getFixedExpenses(userId);
        } catch (error) {
            console.error("Error getting fixed expenses:", error);
            return [];
        }
    },

    // Actualiza un gasto fijo específico (para marcarlo como registrado)
    updateFixedExpense: async (userId: string, fixedExpenseId: string, data: Partial<FixedExpense>) => {
        // Este servicio está siendo migrado al patrón repositorio
        // Se recomienda usar fixedExpenseServiceRepo.updateFixedExpense en su lugar
        try {
            await repositoryFactory.getFixedExpenseRepository().updateFixedExpense(userId, fixedExpenseId, data);
            // La API original retornaba una promesa pero no un valor específico
            return true;
        } catch (error) {
            console.error("Error updating fixed expense:", error);
            throw error;
        }
    }
};