import { useState, useCallback } from 'react';

/**
 * Interfaz común para el manejo de estados de carga y errores en hooks
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/**
 * Interfaz extendida para operaciones asíncronas con resultado
 */
export interface AsyncOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Hook de utilidad para manejar estados de loading y error
 */
export const useLoadingState = (initialLoading = true) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setErrorState = useCallback((errorMessage: string) => {
    setLoading(false);
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    clearError,
    reset
  };
};

/**
 * Utilidad para wrappear operaciones asíncronas con manejo de errores
 */
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage = "Ocurrió un error inesperado"
): Promise<AsyncOperationResult> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error(errorMessage, error);
    const message = error instanceof Error ? error.message : errorMessage;
    return { success: false, error: message };
  }
};
