import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Summary } from '../components/features/reports/Summary/Summary';
import { SavingsGoalSummary } from '../components/features/savings/SavingsGoals/SavingsGoalSummary';
import { BudgetSummary } from '../components/features/financials/BudgetSummary/BudgetSummary';
import { GuestBlockedFeature } from '../components/misc/GuestBlockedFeature/GuestBlockedFeature';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { FixedExpenseNotifications } from '../components/features/fixed-expenses/FixedExpenseNotifications';
import { useFixedExpenseReminders } from '../hooks/expenses/useFixedExpenseReminders';
import { QuickAddButton } from '../components/ui/QuickAddButton';
import { HealthIndicator, calculateHealthStatus, calculateBalanceHealth } from '../components/ui/HealthIndicator';
import { QuickExpenseModal } from '../components/modals/QuickExpenseModal';
import styles from './DashboardPage.module.css';
import { formatCurrency } from '../utils/formatters';
import { PAGE_ROUTES } from '../constants';

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
  setCurrentPage?: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ isGuest, userId, setCurrentPage }) => {
  const {
    categories,
    loadingCategories,
    categoriesError,
    clearCategoriesError
  } = useCategoriesContext();

  const {
    expenses,
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

  const {
    notifications: fixedExpenseNotifications,
    isLoading: loadingNotifications,
    clearNotificationsForFixedExpense
  } = useFixedExpenseReminders(!isGuest ? (userId || null) : null);

  const isLoadingCriticalData = loadingCategories || loadingExpenses;
  const criticalError = categoriesError || expensesError;

  const monthlyIncome = financials?.monthlyIncome || 0;
  const balance = monthlyIncome - totalExpensesMonth - totalFixedExpenses;
  const monthlySpendingPercentage = monthlyIncome > 0
    ? ((totalExpensesMonth + totalFixedExpenses) / monthlyIncome) * 100
    : 0;

  const handleRetryLoadData = () => {
    clearCategoriesError();
    clearExpensesError();
  };

  // Modal de gasto rápido
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Abrir modal de gasto rápido al hacer clic en el botón +
  const handleAddExpense = () => {
    setShowExpenseModal(true);
  };

  // Últimos 5 gastos
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className={styles.dashboard}>
      {/* Resumen Compacto */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>💰 Hoy</span>
          <span className={styles.cardValue}>{formatCurrency(totalExpensesToday)}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>📅 Este mes</span>
          <div className={styles.cardValueRow}>
            <span className={styles.cardValue}>{formatCurrency(totalExpensesMonth)}</span>
            <HealthIndicator
              status={calculateHealthStatus(monthlySpendingPercentage)}
              size="small"
            />
          </div>
        </div>
        <div className={`${styles.summaryCard} ${balance < 0 ? styles.danger : ''}`}>
          <span className={styles.cardLabel}>{balance >= 0 ? '✅ Disponible' : '⚠️ Sobregiro'}</span>
          <div className={styles.cardValueRow}>
            <span className={styles.cardValue}>{formatCurrency(Math.abs(balance))}</span>
            <HealthIndicator
              status={calculateBalanceHealth(balance, monthlyIncome)}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Notificaciones de gastos fijos */}
      {!isGuest && !loadingNotifications && fixedExpenseNotifications.length > 0 && (
        <div className={styles.notificationsSection}>
          <FixedExpenseNotifications
            notifications={fixedExpenseNotifications.slice(0, 3)}
            onDismiss={clearNotificationsForFixedExpense}
          />
        </div>
      )}

      {/* Grid de contenido */}
      <div className={styles.contentGrid}>
        {/* Últimas transacciones */}
        <LoadingStateWrapper
          loading={isLoadingCriticalData}
          error={criticalError}
          onRetry={handleRetryLoadData}
          onDismissError={() => {
            clearCategoriesError();
            clearExpensesError();
          }}
          loadingMessage="Cargando..."
        >
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Últimos gastos</h2>
            {recentExpenses.length > 0 ? (
              <ul className={styles.transactionList}>
                {recentExpenses.map((expense) => (
                  <li key={expense.id} className={styles.transactionItem}>
                    <div className={styles.transactionInfo}>
                      <span className={styles.transactionCategory}>
                        {(() => {
                          const cat = categories.find(c => c.id === expense.categoryId);
                          return cat ? `${cat.icon || '📦'} ${cat.name}` : expense.categoryId;
                        })()}
                      </span>
                      {expense.description && (
                        <span className={styles.transactionDesc}>{expense.description}</span>
                      )}
                    </div>
                    <span className={styles.transactionAmount}>
                      -{formatCurrency(expense.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyMessage}>Sin gastos registrados</p>
            )}
          </section>
        </LoadingStateWrapper>

        {/* Sección lateral */}
        <aside className={styles.sidebar}>
          {isGuest ? (
            <div className={styles.guestSection}>
              <GuestBlockedFeature message="Crea una cuenta para ver presupuestos y metas." />
            </div>
          ) : (
            <>
              <LoadingStateWrapper
                loading={loadingFinancials}
                error={financialsError}
                onDismissError={clearFinancialsError}
                loadingMessage="Cargando..."
              >
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Presupuestos</h2>
                  <BudgetSummary
                    categories={categories}
                    monthlyExpensesByCategory={monthlyExpensesByCategory}
                  />
                </section>
              </LoadingStateWrapper>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Metas de ahorro</h2>
                <SavingsGoalSummary savingsGoals={savingsGoals} />
              </section>
            </>
          )}
        </aside>
      </div>

      {/* Botón flotante para añadir */}
      <QuickAddButton
        onAddExpense={handleAddExpense}
        onNavigate={setCurrentPage}
      />

      {/* Modal de gasto rápido */}
      <QuickExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />
    </div>
  );
};