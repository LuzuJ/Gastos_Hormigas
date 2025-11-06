import { useState, useEffect, useCallback } from 'react';
import { userInitializationService } from '../../services/userInitializationService';

export interface UserDataStatus {
  categories: boolean;
  paymentSources: boolean;
  financials: boolean;
}

export const useUserInitialization = (userId: string | null) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<UserDataStatus>({
    categories: false,
    paymentSources: false,
    financials: false
  });

  // Verificar estado de inicialización
  const checkInitializationStatus = useCallback(async () => {
    if (!userId) {
      setIsInitialized(false);
      setDataStatus({ categories: false, paymentSources: false, financials: false });
      return;
    }

    try {
      const status = await userInitializationService.checkUserDataStatus(userId);
      setDataStatus(status);
      
      // Considerar inicializado si tiene al menos categorías y datos financieros
      const initialized = status.categories && status.financials;
      setIsInitialized(initialized);
      
      return status;
    } catch (error) {
      console.error('Error verificando estado de inicialización:', error);
      setInitializationError('Error al verificar datos del usuario');
      return null;
    }
  }, [userId]);

  // Inicializar datos del usuario
  const initializeUserData = useCallback(async () => {
    if (!userId || isInitializing) return false;

    setIsInitializing(true);
    setInitializationError(null);

    try {
      console.log('Iniciando inicialización de datos del usuario...');
      const success = await userInitializationService.initializeCompleteUserData(userId);
      
      if (success) {
        // Verificar el estado después de la inicialización
        await checkInitializationStatus();
        console.log('Inicialización completada exitosamente');
      } else {
        setInitializationError('Error durante la inicialización de datos');
      }
      
      return success;
    } catch (error) {
      console.error('Error en inicialización:', error);
      setInitializationError('Error inesperado durante la inicialización');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [userId, isInitializing, checkInitializationStatus]);

  // Reiniciar datos del usuario
  const resetUserData = useCallback(async () => {
    if (!userId || isInitializing) return false;

    setIsInitializing(true);
    setInitializationError(null);

    try {
      const success = await userInitializationService.resetUserData(userId);
      
      if (success) {
        await checkInitializationStatus();
        console.log('Datos del usuario reiniciados exitosamente');
      } else {
        setInitializationError('Error al reiniciar datos del usuario');
      }
      
      return success;
    } catch (error) {
      console.error('Error al reiniciar datos:', error);
      setInitializationError('Error inesperado al reiniciar datos');
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [userId, isInitializing, checkInitializationStatus]);

  // Verificar estado al montar y cuando cambie el userId
  useEffect(() => {
    if (userId) {
      checkInitializationStatus();
    }
  }, [userId, checkInitializationStatus]);

  // Auto-inicializar si el usuario no tiene datos
  useEffect(() => {
    if (userId && !isInitialized && !isInitializing && dataStatus.categories === false) {
      console.log('Usuario sin datos detectado, auto-inicializando...');
      initializeUserData();
    }
  }, [userId, isInitialized, isInitializing, dataStatus.categories, initializeUserData]);

  const clearError = useCallback(() => {
    setInitializationError(null);
  }, []);

  return {
    isInitializing,
    isInitialized,
    initializationError,
    dataStatus,
    initializeUserData,
    resetUserData,
    checkInitializationStatus,
    clearError
  };
};