import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { Summary } from '../components/Summary/Summary';
import { SavingsGoalSummary } from '../components/SavingsGoals/SavingsGoalSummary';
import { BudgetSummary } from '../components/BudgetSummary/BudgetSummary';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';
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
    // 2. Consumimos los datos directamente de los contextos que necesitamos
    const { categories, addSubCategory } = useCategoriesContext();
    const { expenses, addExpense, totalExpensesToday } = useExpensesContext();
    const { financials, totalFixedExpenses } = useFinancialsContext();
    const { savingsGoals } = useSavingsGoalsContext();
    const { monthlyExpensesByCategory, totalExpensesMonth } = useCombinedCalculationsContext();

    return (
        <div className={styles.dashboardGrid}>
            <main className={styles.mainColumn}>
                <ExpenseForm 
                    onAdd={async (data) => {
                        const expenseWithDate = { ...data, createdAt: new Date() as any };
                        return addExpense(expenseWithDate);
                    }} 
                    onAddSubCategory={addSubCategory}
                    categories={categories}
                    isSubmitting={false} // Este estado podría venir de useExpensesContext si fuera necesario
                    expenses={expenses}
                />
            </main>

            <aside className={styles.sidebarColumn}>
                <Summary 
                    totalToday={totalExpensesToday} 
                    totalMonth={totalExpensesMonth}
                    monthlyIncome={financials?.monthlyIncome || 0}
                    fixedExpensesTotal={totalFixedExpenses}
                />
                {isGuest ? (
                  <GuestBlockedFeature message="Crea una cuenta para dar seguimiento a tus presupuestos y metas de ahorro." />
                ) : (
                  <>
                    <BudgetSummary 
                      categories={categories} 
                      monthlyExpensesByCategory={monthlyExpensesByCategory} 
                    />
                    <SavingsGoalSummary savingsGoals={savingsGoals} />
                  </>
                )}
            </aside>
        </div>
    );
};