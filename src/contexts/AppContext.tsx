import React, { type ReactNode } from 'react';
import { ExpensesProvider } from './ExpensesContext';
import { FinancialsProvider } from './FinancialsContext';
import { PlanningProvider } from './PlanningContext';
import { NotificationsProvider } from './NotificationsContext';
import { CombinedCalculationsProvider } from './CombinedCalculationsContext';
import { ErrorBoundary } from '../components/layout/ErrorBoundary/ErrorBoundary';
import { useAuth } from './AuthContext';

// Re-exportar todos los hooks de contexto para mantener compatibilidad
export { useAuthContext as useProfileContext } from './AuthContext';
export { useExpensesContext, useCategoriesContext } from './ExpensesContext';
export { useFinancialsContext } from './FinancialsContext';
export { useNetWorthContext, useSavingsGoalsContext } from './PlanningContext';
export { useNotificationsContext } from './NotificationsContext';
export { useCombinedCalculationsContext } from './CombinedCalculationsContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Proveedor principal de la aplicación que orquesta todos los contextos específicos.
 * Esta arquitectura modular permite:
 * - Re-renderizados más eficientes (solo los componentes que usan datos específicos se actualizan)
 * - Mejor organización del código
 * - Facilita el testing de contextos individuales
 * - Permite cargar contextos de forma condicional según las páginas
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || null;
  
  return (
    <NotificationsProvider>
      <FinancialsProvider userId={userId}>
        <ErrorBoundary fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Error en la planificación financiera</h3>
            <p>Hay un problema con los datos de patrimonio neto y metas de ahorro. La aplicación seguirá funcionando con funcionalidad limitada.</p>
          </div>
        }>
          <PlanningProvider userId={userId}>
            <ExpensesProvider userId={userId}>
              <CombinedCalculationsProvider>
                {children}
              </CombinedCalculationsProvider>
            </ExpensesProvider>
          </PlanningProvider>
        </ErrorBoundary>
      </FinancialsProvider>
    </NotificationsProvider>
  );
};