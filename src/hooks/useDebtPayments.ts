import { useState, useEffect, useCallback } from 'react';
import { debtPaymentService, DebtPaymentFormData } from '../services/debtPaymentService';
import { liabilityService } from '../services/liabilityService';
import { useLoadingState, handleAsyncOperation } from './useLoadingState';
import type { DebtPayment, Liability } from '../types';

export const useDebtPayments = (userId: string | null) => {
    const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
    const { 
        loading: loadingPayments, 
        error: paymentsError, 
        startLoading, 
        stopLoading, 
        clearError 
    } = useLoadingState(true);

    useEffect(() => {
        if (!userId) {
            setDebtPayments([]);
            stopLoading();
            return;
        }

        startLoading();
        clearError();

        const unsubscribe = debtPaymentService.onDebtPaymentsUpdate(userId, (data) => {
            setDebtPayments(data);
            stopLoading();
        });

        return unsubscribe;
    }, [userId, startLoading, stopLoading, clearError]);

    const addDebtPayment = useCallback(async (data: DebtPaymentFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => debtPaymentService.addDebtPayment(userId, data),
            'Error al registrar el pago de deuda'
        );
    }, [userId]);

    const deleteDebtPayment = useCallback(async (paymentId: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => debtPaymentService.deleteDebtPayment(userId, paymentId),
            'Error al eliminar el pago de deuda'
        );
    }, [userId]);

    // Función especial para realizar un pago que reduce la deuda
    const makeDebtPayment = useCallback(async (liabilityId: string, amount: number, paymentType: 'regular' | 'extra' | 'interest_only' = 'regular', description?: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        try {
            // 1. Registrar el pago
            const paymentData: DebtPaymentFormData = {
                liabilityId,
                amount,
                paymentType,
                description
            };

            const paymentResult = await debtPaymentService.addDebtPayment(userId, paymentData);
            
            if (!paymentResult) {
                return { success: false, error: 'Error al registrar el pago' };
            }

            // 2. Si es un pago que reduce la deuda principal (no solo intereses), reducir el monto de la deuda
            if (paymentType !== 'interest_only') {
                await liabilityService.makePayment(userId, liabilityId, amount);
            }

            return { success: true };
        } catch (error) {
            console.error('Error al procesar el pago de deuda:', error);
            return { success: false, error: 'Error al procesar el pago de deuda' };
        }
    }, [userId]);

    // Obtener pagos de una deuda específica
    const getPaymentsForLiability = useCallback((liabilityId: string) => {
        return debtPayments.filter(payment => payment.liabilityId === liabilityId);
    }, [debtPayments]);

    // Calcular total pagado para una deuda específica
    const getTotalPaidForLiability = useCallback((liabilityId: string) => {
        return debtPayments
            .filter(payment => payment.liabilityId === liabilityId)
            .reduce((total, payment) => total + payment.amount, 0);
    }, [debtPayments]);

    // Calcular progreso de pago (requiere el monto original de la deuda)
    const getPaymentProgress = useCallback((liability: Liability) => {
        const totalPaid = getTotalPaidForLiability(liability.id);
        const originalAmount = liability.originalAmount || liability.amount;
        const remainingAmount = Math.max(0, originalAmount - totalPaid);
        const progressPercentage = originalAmount > 0 ? (totalPaid / originalAmount) * 100 : 0;
        
        return {
            totalPaid,
            remainingAmount,
            progressPercentage: Math.min(100, progressPercentage),
            originalAmount
        };
    }, [getTotalPaidForLiability]);

    return {
        debtPayments,
        loadingPayments,
        paymentsError,
        clearPaymentsError: clearError,
        addDebtPayment,
        deleteDebtPayment,
        makeDebtPayment,
        getPaymentsForLiability,
        getTotalPaidForLiability,
        getPaymentProgress
    };
};
