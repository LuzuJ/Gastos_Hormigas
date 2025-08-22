import { useState, useEffect, useCallback } from 'react';
import { paymentSourceService } from '../../services/paymentSources/paymentSourceService';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { PaymentSource, PaymentSourceType } from '../../types';

export const usePaymentSources = (userId: string | null) => {
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const { 
    loading: loadingPaymentSources, 
    error: paymentSourcesError, 
    startLoading, 
    stopLoading, 
    clearError 
  } = useLoadingState(true);

  useEffect(() => {
    if (!userId) {
      setPaymentSources([]);
      stopLoading();
      return;
    }

    startLoading();
    clearError();

    // Crear fuentes por defecto si es necesario
    const initializePaymentSources = async () => {
      try {
        // Primero limpiar duplicados
        await paymentSourceService.cleanupDuplicatePaymentSources(userId);
        // Luego crear fuentes por defecto si es necesario
        await paymentSourceService.createDefaultPaymentSources(userId);
      } catch (error) {
        console.error('Error al inicializar fuentes de pago:', error);
      }
    };

    initializePaymentSources();

    // Suscribirse a cambios en las fuentes de pago
    const unsubscribe = paymentSourceService.onPaymentSourcesUpdate(userId, (sources) => {
      setPaymentSources(sources);
      stopLoading();
    });

    return unsubscribe;
  }, [userId, startLoading, stopLoading, clearError]);

  const addPaymentSource = useCallback(async (data: {
    name: string;
    type: PaymentSourceType;
    description?: string;
    balance?: number;
    icon?: string;
    color?: string;
  }) => {
    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (!data.name.trim()) {
      return { success: false, error: 'El nombre es requerido' };
    }

    const paymentSourceData: Omit<PaymentSource, 'id'> = {
      name: data.name.trim(),
      type: data.type,
      description: data.description || '',
      balance: data.balance,
      isActive: true,
      icon: data.icon || paymentSourceService.getDefaultIcon(data.type),
      color: data.color || paymentSourceService.getDefaultColor(data.type)
    };

    return await handleAsyncOperation(
      () => paymentSourceService.addPaymentSource(userId, paymentSourceData),
      'Error al agregar la fuente de pago'
    );
  }, [userId]);

  const updatePaymentSource = useCallback(async (id: string, updates: Partial<PaymentSource>) => {
    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    return await handleAsyncOperation(
      () => paymentSourceService.updatePaymentSource(userId, id, updates),
      'Error al actualizar la fuente de pago'
    );
  }, [userId]);

  const deletePaymentSource = useCallback(async (id: string) => {
    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    return await handleAsyncOperation(
      () => paymentSourceService.deletePaymentSource(userId, id),
      'Error al eliminar la fuente de pago'
    );
  }, [userId]);

  const updateBalance = useCallback(async (id: string, newBalance: number) => {
    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    if (newBalance < 0) {
      return { success: false, error: 'El saldo no puede ser negativo' };
    }

    return await handleAsyncOperation(
      () => paymentSourceService.updateBalance(userId, id, newBalance),
      'Error al actualizar el saldo'
    );
  }, [userId]);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    return await updatePaymentSource(id, { isActive });
  }, [updatePaymentSource]);

  const getActivePaymentSources = useCallback(() => {
    return paymentSources.filter(source => source.isActive);
  }, [paymentSources]);

  const getPaymentSourceById = useCallback((id: string) => {
    return paymentSources.find(source => source.id === id);
  }, [paymentSources]);

  const clearPaymentSourcesError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    paymentSources,
    loadingPaymentSources,
    paymentSourcesError,
    clearPaymentSourcesError,
    addPaymentSource,
    updatePaymentSource,
    deletePaymentSource,
    updateBalance,
    toggleActive,
    getActivePaymentSources,
    getPaymentSourceById
  };
};
