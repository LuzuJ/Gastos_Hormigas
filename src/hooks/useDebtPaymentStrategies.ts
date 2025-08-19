import { useState, useEffect, useCallback, useMemo } from 'react';
import { debtPaymentStrategyService, DebtPaymentStrategyFormData } from '../services/debtPaymentStrategyService';
import { useLoadingState, handleAsyncOperation } from './useLoadingState';
import type { DebtPaymentStrategy, Liability } from '../types';

export const useDebtPaymentStrategies = (userId: string | null, liabilities: Liability[] = []) => {
    const [strategies, setStrategies] = useState<DebtPaymentStrategy[]>([]);
    const [activeStrategy, setActiveStrategy] = useState<DebtPaymentStrategy | null>(null);
    const { 
        loading: loadingStrategies, 
        error: strategiesError, 
        startLoading, 
        stopLoading, 
        clearError 
    } = useLoadingState(true);

    useEffect(() => {
        if (!userId) {
            setStrategies([]);
            setActiveStrategy(null);
            stopLoading();
            return;
        }

        startLoading();
        clearError();

        const unsubscribe = debtPaymentStrategyService.onDebtPaymentStrategiesUpdate(userId, (data) => {
            setStrategies(data);
            const active = data.find(strategy => strategy.isActive);
            setActiveStrategy(active || null);
            stopLoading();
        });

        return unsubscribe;
    }, [userId, startLoading, stopLoading, clearError]);

    const addStrategy = useCallback(async (data: DebtPaymentStrategyFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => debtPaymentStrategyService.addDebtPaymentStrategy(userId, data),
            'Error al agregar estrategia de pago'
        );
    }, [userId]);

    const updateStrategy = useCallback(async (strategyId: string, data: Partial<DebtPaymentStrategyFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => debtPaymentStrategyService.updateDebtPaymentStrategy(userId, strategyId, data),
            'Error al actualizar estrategia de pago'
        );
    }, [userId]);

    const deleteStrategy = useCallback(async (strategyId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => debtPaymentStrategyService.deleteDebtPaymentStrategy(userId, strategyId),
            'Error al eliminar estrategia de pago'
        );
    }, [userId]);

    const setActiveStrategyById = useCallback(async (strategyId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => debtPaymentStrategyService.setActiveStrategy(userId, strategyId),
            'Error al activar estrategia de pago'
        );
    }, [userId]);

    // Generar estrategias automáticas basadas en las deudas actuales
    const generateAutomaticStrategies = useCallback((monthlyExtraBudget: number = 0) => {
        if (liabilities.length === 0) return [];

        const strategies: Omit<DebtPaymentStrategyFormData, 'isActive'>[] = [];

        // Estrategia Bola de Nieve
        const snowballOrder = [...liabilities]
            .sort((a, b) => a.amount - b.amount)
            .map(debt => debt.id);

        strategies.push({
            name: 'Bola de Nieve',
            type: 'snowball',
            priorityOrder: snowballOrder,
            monthlyExtraBudget,
            description: 'Paga primero las deudas más pequeñas para obtener victorias rápidas y mantener la motivación.'
        });

        // Estrategia Avalancha
        const avalancheOrder = [...liabilities]
            .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))
            .map(debt => debt.id);

        strategies.push({
            name: 'Avalancha',
            type: 'avalanche',
            priorityOrder: avalancheOrder,
            monthlyExtraBudget,
            description: 'Paga primero las deudas con mayor interés para minimizar el costo total a largo plazo.'
        });

        return strategies;
    }, [liabilities]);

    // Calcular métricas para todas las estrategias
    const strategiesWithMetrics = useMemo(() => {
        return strategies.map(strategy => {
            const metrics = debtPaymentStrategyService.calculateStrategyMetrics(strategy, liabilities);
            return {
                ...strategy,
                ...metrics
            };
        });
    }, [strategies, liabilities]);

    // Obtener la mejor estrategia (menor tiempo de pago)
    const bestStrategy = useMemo(() => {
        if (strategiesWithMetrics.length === 0) return null;
        
        return strategiesWithMetrics.reduce((best, current) => 
            current.estimatedMonthsToPayoff < best.estimatedMonthsToPayoff ? current : best
        );
    }, [strategiesWithMetrics]);

    // Calcular progreso de la estrategia activa
    const activeStrategyProgress = useMemo(() => {
        if (!activeStrategy || liabilities.length === 0) return null;

        const totalDebt = liabilities.reduce((sum, debt) => sum + debt.amount, 0);
        const completedDebts = activeStrategy.priorityOrder.filter(debtId => {
            const debt = liabilities.find(l => l.id === debtId);
            return debt ? debt.amount === 0 : false;
        }).length;

        const progressPercentage = activeStrategy.priorityOrder.length > 0 
            ? (completedDebts / activeStrategy.priorityOrder.length) * 100 
            : 0;

        return {
            totalDebt,
            completedDebts,
            totalDebts: activeStrategy.priorityOrder.length,
            progressPercentage,
            nextDebtId: activeStrategy.priorityOrder.find(debtId => {
                const debt = liabilities.find(l => l.id === debtId);
                return debt ? debt.amount > 0 : false;
            }) || null
        };
    }, [activeStrategy, liabilities]);

    // Validar que una estrategia sea válida
    const validateStrategy = useCallback((strategyData: DebtPaymentStrategyFormData) => {
        const errors: string[] = [];

        if (!strategyData.name.trim()) {
            errors.push('El nombre de la estrategia es requerido');
        }

        if (strategyData.monthlyExtraBudget < 0) {
            errors.push('El presupuesto extra no puede ser negativo');
        }

        if (strategyData.priorityOrder.length === 0) {
            errors.push('Debe incluir al menos una deuda en la estrategia');
        }

        // Verificar que todas las deudas en priorityOrder existan
        const invalidDebtIds = strategyData.priorityOrder.filter(debtId => 
            !liabilities.some(debt => debt.id === debtId)
        );

        if (invalidDebtIds.length > 0) {
            errors.push('La estrategia incluye deudas que ya no existen');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [liabilities]);

    return {
        strategies,
        strategiesWithMetrics,
        activeStrategy,
        activeStrategyProgress,
        bestStrategy,
        loadingStrategies,
        strategiesError,
        clearStrategiesError: clearError,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        setActiveStrategyById,
        generateAutomaticStrategies,
        validateStrategy
    };
};
