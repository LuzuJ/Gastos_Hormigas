import { useCallback, useEffect, useMemo } from 'react';
import { useNotificationsContext } from '../../contexts/NotificationsContext';
import type { FixedExpense, Category } from '../../types';

export interface FixedExpenseNotification {
  id: string;
  fixedExpenseId: string;
  message: string;
  daysUntilDue: number;
  amount: number;
  description: string;
  dueDate: Date;
}

export const useFixedExpenseNotifications = (
  fixedExpenses: FixedExpense[],
  categories: Category[]
) => {
  const { addNotification, removeNotificationByCustomId, notifications } = useNotificationsContext();

  // Función para calcular las notificaciones pendientes
  const calculatePendingNotifications = useCallback(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentMonthMarker = `${currentYear}-${currentMonth + 1}`;

    const pendingNotifications: FixedExpenseNotification[] = [];

    fixedExpenses.forEach(fixedExpense => {
      // Verificar si el gasto ya fue registrado este mes
      const hasBeenPostedThisMonth = fixedExpense.lastPostedMonth === currentMonthMarker;
      
      if (!hasBeenPostedThisMonth) {
        // Calcular la fecha de vencimiento
        let dueDate = new Date(currentYear, currentMonth, fixedExpense.dayOfMonth);
        
        // Si la fecha ya pasó este mes, programar para el siguiente mes
        if (dueDate < today) {
          dueDate = new Date(currentYear, currentMonth + 1, fixedExpense.dayOfMonth);
        }

        // Calcular días hasta vencimiento
        const diffTime = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Generar notificación si faltan 3 días o menos (y es positivo)
        if (daysUntilDue <= 3 && daysUntilDue >= 0) {
          let message: string;
          if (daysUntilDue === 0) {
            message = `¡Hoy! Tu pago de '${fixedExpense.description}' por $${fixedExpense.amount.toFixed(2)} se registrará hoy`;
          } else if (daysUntilDue === 1) {
            message = `Recordatorio: Tu pago de '${fixedExpense.description}' por $${fixedExpense.amount.toFixed(2)} se registrará mañana`;
          } else {
            message = `Recordatorio: Tu pago de '${fixedExpense.description}' por $${fixedExpense.amount.toFixed(2)} se registrará en ${daysUntilDue} días`;
          }

          pendingNotifications.push({
            id: `fixed-expense-${fixedExpense.id}`,
            fixedExpenseId: fixedExpense.id,
            message,
            daysUntilDue,
            amount: fixedExpense.amount,
            description: fixedExpense.description,
            dueDate
          });
        }
      }
    });

    return pendingNotifications;
  }, [fixedExpenses, categories]);

  // Función para agregar las notificaciones al sistema
  const updateNotifications = useCallback(() => {
    const pendingNotifications = calculatePendingNotifications();

    // Obtener IDs de notificaciones de gastos fijos existentes
    const existingFixedExpenseNotifications = notifications.filter(
      notification => notification.customId && notification.customId.startsWith('fixed-expense-')
    );

    // Remover notificaciones que ya no son relevantes
    existingFixedExpenseNotifications.forEach(notification => {
      const stillRelevant = pendingNotifications.some(
        pending => pending.id === notification.customId
      );
      
      if (!stillRelevant && notification.customId) {
        removeNotificationByCustomId(notification.customId);
      }
    });

    // Agregar nuevas notificaciones
    pendingNotifications.forEach(pending => {
      const alreadyExists = notifications.some(
        notification => notification.customId === pending.id
      );

      if (!alreadyExists) {
        // Determinar el tipo de notificación basado en días restantes
        let type: 'info' | 'warning' | 'danger';
        if (pending.daysUntilDue === 0) {
          type = 'danger'; // Hoy es crítico
        } else if (pending.daysUntilDue === 1) {
          type = 'warning'; // Mañana es advertencia
        } else {
          type = 'info'; // 2-3 días es informativo
        }

        addNotification({
          message: pending.message,
          type,
          customId: pending.id
        });
      }
    });
  }, [calculatePendingNotifications, notifications, addNotification, removeNotificationByCustomId]);

  // Función para limpiar notificaciones cuando un gasto fijo se registra
  const clearNotificationsForFixedExpense = useCallback((fixedExpenseId: string) => {
    const customId = `fixed-expense-${fixedExpenseId}`;
    removeNotificationByCustomId(customId);
  }, [removeNotificationByCustomId]);

  // Obtener notificaciones actuales de gastos fijos
  const currentFixedExpenseNotifications = useMemo(() => {
    return calculatePendingNotifications();
  }, [calculatePendingNotifications]);

  // Efecto para actualizar notificaciones cuando cambien los gastos fijos
  useEffect(() => {
    updateNotifications();
  }, [updateNotifications]);

  // Efecto para verificar notificaciones cada hora
  useEffect(() => {
    const interval = setInterval(() => {
      updateNotifications();
    }, 60 * 60 * 1000); // Cada hora

    return () => clearInterval(interval);
  }, [updateNotifications]);

  return {
    currentFixedExpenseNotifications,
    updateNotifications,
    clearNotificationsForFixedExpense,
    calculatePendingNotifications
  };
};
