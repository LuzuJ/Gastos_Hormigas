import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { Summary } from '../components/Summary/Summary';
import { SavingsGoalSummary } from '../components/SavingsGoals/SavingsGoalSummary';
import { BudgetSummary } from '../components/BudgetSummary/BudgetSummary';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import styles from './DashboardPage.module.css';

// 1. Importamos los nuevos hooks de contexto
import { 
  useCategoriesContext, 
  useExpensesContext, 
  useFinancialsContext, 
  useSavingsGoalsContext,
  useCombinedCalculationsContext 
} from '../contexts/AppContext';

interface DashboardPageProps {
  isGuest: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ isGuest }) => {
    // 2. Consumimos los datos y estados de loading/error de los contextos
    const { 
      categories, 
      addSubCategory, 
      loadingCategories, 
      categoriesError, 
      clearCategoriesError 
    } = useCategoriesContext();
    
    const { 
      expenses, 
      addExpense, 
      totalExpensesToday, 
      loadingExpenses, 
      expensesError, 
      clearExpensesError 
    } = useExpensesContext();
    
    const { 
      financials, 
      totalFixedExpenses, 
      loadingFinancials, 
      financialsError, 
      clearFinancialsError 
    } = useFinancialsContext();
    
    const { savingsGoals } = useSavingsGoalsContext();
    const { monthlyExpensesByCategory, totalExpensesMonth } = useCombinedCalculationsContext();

    // Verificar si hay datos críticos cargando o con error
    const isLoadingCriticalData = loadingCategories || loadingExpenses;
    const criticalError = categoriesError || expensesError;

    const handleRetryLoadData = () => {
      clearCategoriesError();
      clearExpensesError();
      // En una implementación real, aquí podrías forzar una recarga de datos
    };

    // Crear wrapper para addSubCategory que maneje el AsyncOperationResult
    const handleAddSubCategory = async (categoryId: string, subCategoryName: string) => {
      const result = await addSubCategory(categoryId, subCategoryName);
      if (!result.success && result.error) {
        // Podrías mostrar una notificación de error aquí
        console.error('Error al agregar subcategoría:', result.error);
      }
    };

    return (
        <div className={styles.dashboardGrid}>
            <main className={styles.mainColumn}>
                <LoadingStateWrapper
                  loading={isLoadingCriticalData}
                  error={criticalError}
                  onRetry={handleRetryLoadData}
                  onDismissError={() => {
                    clearCategoriesError();
                    clearExpensesError();
                  }}
                  loadingMessage="Cargando datos del dashboard..."
                >
                  <ExpenseForm 
                      onAdd={async (data) => {
                          const expenseWithDate = { ...data, createdAt: new Date() as any };
                          return addExpense(expenseWithDate);
                      }} 
                      onAddSubCategory={handleAddSubCategory}
                      categories={categories}
                      isSubmitting={false}
                      expenses={expenses}
                  />
                </LoadingStateWrapper>
            </main>

            <aside className={styles.sidebarColumn}>
                <LoadingStateWrapper
                  loading={loadingFinancials}
                  error={financialsError}
                  onDismissError={clearFinancialsError}
                  loadingMessage="Cargando datos financieros..."
                >
                  <Summary 
                      totalToday={totalExpensesToday} 
                      totalMonth={totalExpensesMonth}
                      monthlyIncome={financials?.monthlyIncome || 0}
                      fixedExpensesTotal={totalFixedExpenses}
                  />
                </LoadingStateWrapper>

                {isGuest ? (
                  <GuestBlockedFeature message="Crea una cuenta para dar seguimiento a tus presupuestos y metas de ahorro." />
                ) : (
                  <>
                    {!isLoadingCriticalData && !criticalError && (
                      <>
                        <BudgetSummary 
                          categories={categories} 
                          monthlyExpensesByCategory={monthlyExpensesByCategory} 
                        />
                        <SavingsGoalSummary savingsGoals={savingsGoals} />
                      </>
                    )}
                  </>
                )}
            </aside>
        </div>
    );
};