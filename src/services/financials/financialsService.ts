import { repositoryFactory } from '../../repositories';
import type { Financials } from '../../types';

// Tipo para mantener compatibilidad con código existente
type FinancialsCallback = (data: Financials | null, error?: Error) => void;

/**
 * Servicio para la gestión de información financiera
 * @deprecated Favor de utilizar financialsServiceRepo.ts que implementa el patrón repositorio
 */
export const financialsService = {
    onFinancialsUpdate: (userId: string, callback: FinancialsCallback) => {
        try {
            // Este servicio está siendo migrado al patrón repositorio
            // Se recomienda usar financialsServiceRepo.onFinancialsUpdate en su lugar
            return repositoryFactory.getFinancialsRepository().subscribeToFinancials(
                userId, 
                (financials) => callback(financials)
            );
        } catch (error) {
            console.error("Error fetching financials:", error);
            callback(null, error instanceof Error ? error : new Error(String(error)));
            // Devolver función noop para mantener la compatibilidad
            return () => {};
        }
    },

    setMonthlyIncome: async (userId: string, income: number) => {
        // Este servicio está siendo migrado al patrón repositorio
        // Se recomienda usar financialsServiceRepo.setMonthlyIncome en su lugar
        try {
            await repositoryFactory.getFinancialsRepository().updateFinancials(userId, { monthlyIncome: income });
            // La API original retornaba una promesa pero no un valor específico
            return true;
        } catch (error) {
            console.error("Error setting monthly income:", error);
            throw error;
        }
    },
};