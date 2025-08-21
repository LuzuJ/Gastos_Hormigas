import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { Summary } from '../components/Summary/Summary';
import { SavingsGoalSummary } from '../components/SavingsGoals/SavingsGoalSummary';
import { BudgetSummary } from '../components/BudgetSummary/BudgetSummary';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { FixedExpenseNotifications } from '../components/FixedExpenseNotifications';
import { useFixedExpenseReminders } from '../hooks/useFixedExpenseReminders';
import styles from './DashboardPage.module.css';
import { formatCurrency } from '../utils/formatters';

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
  userId?: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ isGuest, userId }) => {
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
      clearFinancialsError,
      getActivePaymentSources
    } = useFinancialsContext();
    
    const { savingsGoals } = useSavingsGoalsContext();
    const { monthlyExpensesByCategory, totalExpensesMonth } = useCombinedCalculationsContext();

    // Hook para notificaciones de gastos fijos (solo para usuarios registrados)
    const {
      notifications: fixedExpenseNotifications,
      isLoading: loadingNotifications,
      clearNotificationsForFixedExpense
    } = useFixedExpenseReminders(!isGuest ? (userId || null) : null);

    // Verificar si hay datos críticos cargando o con error
    const isLoadingCriticalData = loadingCategories || loadingExpenses;
    const criticalError = categoriesError || expensesError;

    // Calcular métricas para el dashboard
    const monthlyIncome = financials?.monthlyIncome || 0;
    const balance = monthlyIncome - totalExpensesMonth;
    const monthlySpendingPercentage = monthlyIncome > 0 ? (totalExpensesMonth / monthlyIncome) * 100 : 0;

    // Obtener saludo basado en la hora
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return '¡Buenos días!';
      if (hour < 18) return '¡Buenas tardes!';
      return '¡Buenas noches!';
    };

    // Obtener fecha formateada
    const getFormattedDate = () => {
      return new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

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
        <div className={styles.dashboard}>
            {/* Header del Dashboard */}
            <header className={styles.dashboardHeader}>
              <div className={styles.greetingSection}>
                <h1 className={styles.greeting}>{getGreeting()}</h1>
                <p className={styles.date}>{getFormattedDate()}</p>
              </div>
              
              <div className={styles.quickStats}>
                <div className={styles.quickStat}>
                  <div className={styles.statIcon}>💰</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{formatCurrency(totalExpensesToday)}</span>
                    <span className={styles.statLabel}>Gastado Hoy</span>
                  </div>
                </div>
                
                <div className={styles.quickStat}>
                  <div className={styles.statIcon}>📊</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{monthlySpendingPercentage.toFixed(1)}%</span>
                    <span className={styles.statLabel}>Del Presupuesto</span>
                  </div>
                </div>
                
                <div className={styles.quickStat}>
                  <div className={styles.statIcon}>💳</div>
                  <div className={styles.statInfo}>
                    <span className={`${styles.statValue} ${balance >= 0 ? styles.positive : styles.negative}`}>
                      {formatCurrency(Math.abs(balance))}
                    </span>
                    <span className={styles.statLabel}>{balance >= 0 ? 'Disponible' : 'Sobregiro'}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Grid Principal del Dashboard */}
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
                      <div className={styles.expenseFormSection}>
                        <h2 className={styles.sectionTitle}>
                          <span className={styles.sectionIcon}>➕</span>{' '}
                          Registrar Gasto
                        </h2>
                        <ExpenseForm 
                            onAdd={async (data) => {
                                const expenseWithDate = { ...data, createdAt: new Date() as any };
                                return addExpense(expenseWithDate);
                            }} 
                            onAddSubCategory={handleAddSubCategory}
                            categories={categories}
                            isSubmitting={false}
                            expenses={expenses}
                            paymentSources={getActivePaymentSources()}
                        />
                      </div>
                    </LoadingStateWrapper>

                    {/* Secciones de Presupuestos y Metas movidas a la izquierda */}
                    {isGuest ? (
                      <div className={styles.guestSection}>
                        <GuestBlockedFeature message="Crea una cuenta para dar seguimiento a tus presupuestos y metas de ahorro." />
                      </div>
                    ) : (
                      <>
                        {!isLoadingCriticalData && !criticalError && (
                          <>
                            <div className={styles.budgetSection}>
                              <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>🎯</span>{' '}
                                Presupuestos
                              </h2>
                              <BudgetSummary 
                                categories={categories} 
                                monthlyExpensesByCategory={monthlyExpensesByCategory} 
                              />
                            </div>
                            
                            <div className={styles.savingsSection}>
                              <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>🎁</span>{' '}
                                Metas de Ahorro
                              </h2>
                              <SavingsGoalSummary savingsGoals={savingsGoals} />
                            </div>
                          </>
                        )}
                      </>
                    )}
                </main>

                <aside className={styles.sidebarColumn}>
                    {/* Notificaciones de gastos fijos - Solo para usuarios registrados */}
                    {!isGuest && !loadingNotifications && fixedExpenseNotifications.length > 0 && (
                      <div className={styles.notificationsSection}>
                        <FixedExpenseNotifications
                          notifications={fixedExpenseNotifications.slice(0, 5)} // Mostrar máximo 5
                          onDismiss={clearNotificationsForFixedExpense}
                          className={styles.fixedExpenseNotifications}
                        />
                      </div>
                    )}

                    <LoadingStateWrapper
                      loading={loadingFinancials}
                      error={financialsError}
                      onDismissError={clearFinancialsError}
                      loadingMessage="Cargando datos financieros..."
                    >
                      <div className={styles.summarySection}>
                        <h2 className={styles.sectionTitle}>
                          <span className={styles.sectionIcon}>📋</span>{' '}
                          Resumen Financiero
                        </h2>
                        <Summary 
                            totalToday={totalExpensesToday} 
                            totalMonth={totalExpensesMonth}
                            monthlyIncome={financials?.monthlyIncome || 0}
                            fixedExpensesTotal={totalFixedExpenses}
                        />
                      </div>
                    </LoadingStateWrapper>
                </aside>
            </div>
        </div>
    );
};