import { useState, useEffect, useCallback } from 'react';
import { PaymentSourceServiceRepo } from '../../services/paymentSourceServiceRepo';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { PaymentSource, PaymentSourceType } from '../../types';

// Crear instancia del servicio moderno
const paymentSourceServiceRepo = new PaymentSourceServiceRepo();

// Funciones auxiliares para valores por defecto
const getDefaultIcon = (type: PaymentSourceType): string => {
  const iconMap: Record<PaymentSourceType, string> = {
    cash: '💵',
    checking: '🏦',
    savings: '🏛️',
    credit_card: '💳',
    debit_card: '💳',
    loan: '📄',
    income_salary: '💼',
    income_extra: '💰',
    investment: '📈',
    other: '📝'
  };
  return iconMap[type] || '📝';
};

const getDefaultColor = (type: PaymentSourceType): string => {
  const colorMap: Record<PaymentSourceType, string> = {
    cash: '#10B981',      // Verde
    checking: '#3B82F6',   // Azul
    savings: '#06B6D4',    // Cyan
    credit_card: '#F59E0B', // Amarillo/Naranja
    debit_card: '#8B5CF6',  // Púrpura
    loan: '#EF4444',       // Rojo
    income_salary: '#8B5CF6', // Púrpura
    income_extra: '#10B981',  // Verde
    investment: '#F97316',    // Naranja
    other: '#6B7280'         // Gris
  };
  return colorMap[type] || '#6B7280';
};

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

    // Cargar fuentes de pago usando el servicio moderno
    const loadPaymentSources = async () => {
      try {
        // Primero inicializar fuentes por defecto si es necesario
        await paymentSourceServiceRepo.initializeDefaultPaymentSources(userId);
        
        // Luego cargar todas las fuentes
        const sources = await paymentSourceServiceRepo.getPaymentSources(userId);
        setPaymentSources(sources);
      } catch (error) {
        console.error('Error al cargar fuentes de pago:', error);
        // Incluso si falla la carga de payment sources, continuar con array vacío
        setPaymentSources([]);
      } finally {
        stopLoading();
      }
    };

    loadPaymentSources();

    // TODO: Implementar suscripción en tiempo real cuando sea necesario
    // Para ahora, solo cargamos una vez
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
      icon: data.icon || getDefaultIcon(data.type),
      color: data.color || getDefaultColor(data.type)
    };

    return await handleAsyncOperation(
      () => paymentSourceServiceRepo.addPaymentSource(userId, paymentSourceData),
      'Error al agregar la fuente de pago'
    );
  }, [userId]);

  const updatePaymentSource = useCallback(async (id: string, updates: Partial<PaymentSource>) => {
    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    return await handleAsyncOperation(
      () => paymentSourceServiceRepo.updatePaymentSource(userId, id, updates),
      'Error al actualizar la fuente de pago'
    );
  }, [userId]);

  const deletePaymentSource = useCallback(async (id: string) => {
    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    return await handleAsyncOperation(
      () => paymentSourceServiceRepo.deletePaymentSource(userId, id),
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
      () => paymentSourceServiceRepo.updatePaymentSourceBalance(userId, id, newBalance),
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
