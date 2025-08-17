import React, { createContext, useContext, type ReactNode } from 'react';
import { useExpenses, type useExpenses as useExpensesType } from '../hooks/useExpenses';
import { useCategories, type useCategories as useCategoriesType } from '../hooks/useCategories';
import { useFinancials, type useFinancials as useFinancialsType } from '../hooks/useFinancials';
import { useSavingsGoals, type useSavingsGoals as useSavingsGoalsType } from '../hooks/useSavingsGoals';
import { useUserProfile, type useUserProfile as useUserProfileType } from '../hooks/useUserProfile';
import { useNetWorth, type useNetWorth as useNetWorthType } from '../hooks/useNetWorth';
import { useNotifications, type useNotifications as useNotificationsType } from '../hooks/useNotifications';
import { useCombinedCalculations } from '../hooks/useCombinedCalculations';

// --- Creamos un contexto para cada hook ---
const ExpensesContext = createContext<ReturnType<typeof useExpensesType> | null>(null);
const CategoriesContext = createContext<ReturnType<typeof useCategoriesType> | null>(null);
const FinancialsContext = createContext<ReturnType<typeof useFinancialsType> | null>(null);
const SavingsGoalsContext = createContext<ReturnType<typeof useSavingsGoalsType> | null>(null);
const ProfileContext = createContext<ReturnType<typeof useUserProfileType> | null>(null);
const NetWorthContext = createContext<ReturnType<typeof useNetWorthType> | null>(null);
const NotificationsContext = createContext<ReturnType<typeof useNotificationsType> | null>(null);
const CombinedCalculationsContext = createContext<ReturnType<typeof useCombinedCalculations> | null>(null);

// --- Creamos el Proveedor Principal ---
interface AppProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, userId }) => {
  // Instanciamos todos los hooks principales aquí
  const expensesData = useExpenses(userId);
  const categoriesData = useCategories(userId);
  const financialsData = useFinancials(userId);
  const savingsGoalsData = useSavingsGoals(userId);
  const profileData = useUserProfile(userId);
  const netWorthData = useNetWorth(userId);
  const notificationsData = useNotifications();

  // El nuevo hook para cálculos combinados
  const combinedCalculationsData = useCombinedCalculations({
    expenses: expensesData.expenses,
    categories: categoriesData.categories,
    totalFixedExpenses: financialsData.totalFixedExpenses,
    addNotification: notificationsData.addNotification
  });

  return (
    <NotificationsContext.Provider value={notificationsData}>
      <ProfileContext.Provider value={profileData}>
        <NetWorthContext.Provider value={netWorthData}>
          <SavingsGoalsContext.Provider value={savingsGoalsData}>
            <FinancialsContext.Provider value={financialsData}>
              <CategoriesContext.Provider value={categoriesData}>
                <ExpensesContext.Provider value={expensesData}>
                  <CombinedCalculationsContext.Provider value={combinedCalculationsData}>
                    {children}
                  </CombinedCalculationsContext.Provider>
                </ExpensesContext.Provider>
              </CategoriesContext.Provider>
            </FinancialsContext.Provider>
          </SavingsGoalsContext.Provider>
        </NetWorthContext.Provider>
      </ProfileContext.Provider>
    </NotificationsContext.Provider>
  );
};

// --- Creamos hooks personalizados para consumir cada contexto ---
// Esto evita que los componentes tengan que lidiar con valores nulos
const createUseContextHook = <T,>(context: React.Context<T | null>, name: string) => {
  return () => {
    const ctx = useContext(context);
    if (!ctx) throw new Error(`${name} debe ser usado dentro de su Provider`);
    return ctx;
  };
};

export const useExpensesContext = createUseContextHook(ExpensesContext, 'useExpensesContext');
export const useCategoriesContext = createUseContextHook(CategoriesContext, 'useCategoriesContext');
export const useFinancialsContext = createUseContextHook(FinancialsContext, 'useFinancialsContext');
export const useSavingsGoalsContext = createUseContextHook(SavingsGoalsContext, 'useSavingsGoalsContext');
export const useProfileContext = createUseContextHook(ProfileContext, 'useProfileContext');
export const useNetWorthContext = createUseContextHook(NetWorthContext, 'useNetWorthContext');
export const useNotificationsContext = createUseContextHook(NotificationsContext, 'useNotificationsContext');
export const useCombinedCalculationsContext = createUseContextHook(CombinedCalculationsContext, 'useCombinedCalculationsContext');