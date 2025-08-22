import { useEffect, useRef } from 'react';
import { useFixedExpenseNotifications } from '../financials/useFixedExpenseNotifications';
import { useFinancialsContext } from '../../contexts/FinancialsContext';
import { useCategories } from '../categories/useCategories';
import { automationService } from '../../services/automation/automationService';

/**
 * Hook principal que integra el sistema completo de recordatorios para gastos fijos
 * - Maneja las notificaciones de recordatorio
 * - Integra con la automatización de gastos fijos
 * - Se ejecuta automáticamente cuando hay gastos fijos
 */
export const useFixedExpenseReminders = (userId: string | null) => {
  const { fixedExpenses, loadingFixedExpenses } = useFinancialsContext();
  const { categories, loadingCategories } = useCategories(userId);
  const isInitializedRef = useRef(false);

  // Hook de notificaciones para gastos fijos
  const {
    currentFixedExpenseNotifications,
    updateNotifications,
    clearNotificationsForFixedExpense,
    calculatePendingNotifications
  } = useFixedExpenseNotifications(fixedExpenses, categories);

  // Configurar callback en automationService para limpiar notificaciones
  useEffect(() => {
    if (!userId || loadingFixedExpenses || loadingCategories) return;

    // Establecer el callback para limpiar notificaciones cuando se posten gastos
    automationService.setClearNotificationCallback(clearNotificationsForFixedExpense);

    // Función de limpieza
    return () => {
      automationService.setClearNotificationCallback(null);
    };
  }, [userId, loadingFixedExpenses, loadingCategories, clearNotificationsForFixedExpense]);

  // Ejecutar automatización y refresh de notificaciones al inicializar
  useEffect(() => {
    if (!userId || loadingFixedExpenses || loadingCategories || isInitializedRef.current) {
      return;
    }

    if (fixedExpenses.length > 0 && categories.length > 0) {
      // Marcar como inicializado para evitar múltiples ejecuciones
      isInitializedRef.current = true;

      // Ejecutar automatización de gastos fijos
      const runAutomation = async () => {
        try {
          await automationService.checkAndPostFixedExpenses(userId, categories);
          // Refresh notificaciones después de la automatización
          updateNotifications();
        } catch (error) {
          console.error('Error en automatización de gastos fijos:', error);
        }
      };

      runAutomation();
    }
  }, [userId, fixedExpenses, categories, loadingFixedExpenses, loadingCategories, updateNotifications]);

  // Reset del estado de inicialización cuando cambia el usuario
  useEffect(() => {
    isInitializedRef.current = false;
  }, [userId]);

  // Función para obtener estadísticas de notificaciones
  const getNotificationStats = () => {
    const pending = calculatePendingNotifications();
    const urgent = pending.filter(n => n.daysUntilDue <= 0).length; // Vencidos
    const warnings = pending.filter(n => n.daysUntilDue === 1).length; // Mañana
    const info = pending.filter(n => n.daysUntilDue >= 2).length; // 2+ días
    
    return {
      total: pending.length,
      urgent,
      warnings,
      info
    };
  };

  return {
    notifications: currentFixedExpenseNotifications,
    notificationStats: getNotificationStats(),
    isLoading: loadingFixedExpenses || loadingCategories,
    refreshNotifications: updateNotifications,
    clearNotificationsForFixedExpense
  };
};
