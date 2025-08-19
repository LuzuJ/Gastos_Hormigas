import React, { type ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ExpensesProvider } from './ExpensesContext';
import { FinancialsProvider } from './FinancialsContext';
import { PlanningProvider } from './PlanningContext';
import { NotificationsProvider } from './NotificationsContext';
import { CombinedCalculationsProvider } from './CombinedCalculationsContext';

// Re-exportar todos los hooks de contexto para mantener compatibilidad
export { useAuthContext as useProfileContext } from './AuthContext';
export { useExpensesContext, useCategoriesContext } from './ExpensesContext';
export { useFinancialsContext } from './FinancialsContext';
export { useNetWorthContext, useSavingsGoalsContext } from './PlanningContext';
export { useNotificationsContext } from './NotificationsContext';
export { useCombinedCalculationsContext } from './CombinedCalculationsContext';

interface AppProviderProps {
  children: ReactNode;
  userId: string | null;
}

/**
 * Proveedor principal de la aplicación que orquesta todos los contextos específicos.
 * Esta arquitectura modular permite:
 * - Re-renderizados más eficientes (solo los componentes que usan datos específicos se actualizan)
 * - Mejor organización del código
 * - Facilita el testing de contextos individuales
 * - Permite cargar contextos de forma condicional según las páginas
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children, userId }) => {
  return (
    <NotificationsProvider>
      <AuthProvider userId={userId}>
        <FinancialsProvider userId={userId}>
          <PlanningProvider userId={userId}>
            <ExpensesProvider userId={userId}>
              <CombinedCalculationsProvider>
                {children}
              </CombinedCalculationsProvider>
            </ExpensesProvider>
          </PlanningProvider>
        </FinancialsProvider>
      </AuthProvider>
    </NotificationsProvider>
  );
};