import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { Summary } from '../components/Summary/Summary';
import { useExpensesController } from '../hooks/useExpensesController';
import { ExpenseChart } from '../components/ExpenseChart/ExpenseChart';
import { SavingsGoalSummary } from '../components/SavingsGoals/SavingsGoalSummary';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart/MonthlyTrendChart';
import styles from './DashboardPage.module.css';

interface DashboardPageProps {
  userId: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userId }) => {
     const {
        categories, 
        addExpense, 
        savingsGoals,
        addSubCategory,
        totalExpensesToday,
        financials, 
        totalExpensesMonth, 
        totalFixedExpenses,
        monthlyExpensesTrend,
        monthlyExpensesByCategory
    } = useExpensesController(userId);

    return (
        <div className={styles.dashboardGrid}>
            
            {/* --- COLUMNA IZQUIERDA (PRINCIPAL) --- */}
            <main className={styles.mainColumn}>
                <ExpenseForm 
                    onAdd={addExpense} 
                    onAddSubCategory={addSubCategory}
                    categories={categories}
                    isSubmitting={false}
                />
                <ExpenseChart data={monthlyExpensesByCategory} />
                <MonthlyTrendChart data={monthlyExpensesTrend} />
            </main>

            {/* --- COLUMNA DERECHA (LATERAL) --- */}
            <aside className={styles.sidebarColumn}>
                <Summary 
                    totalToday={totalExpensesToday} 
                    totalMonth={totalExpensesMonth}
                    monthlyIncome={financials?.monthlyIncome || 0}
                    fixedExpensesTotal={totalFixedExpenses}
                />
                <SavingsGoalSummary savingsGoals={savingsGoals} />
            </aside>

        </div>
    );
};