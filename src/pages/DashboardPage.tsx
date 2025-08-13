import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { Summary } from '../components/Summary/Summary';
import { useExpensesController } from '../hooks/useExpensesController';
import { SavingsGoalSummary } from '../components/SavingsGoals/SavingsGoalSummary';
import styles from './DashboardPage.module.css';

interface DashboardPageProps {
  userId: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userId }) => {
     const {
        categories, 
        expenses,
        addExpense, 
        savingsGoals,
        addSubCategory,
        totalExpensesToday,
        financials, 
        totalExpensesMonth, 
        totalFixedExpenses,
    } = useExpensesController(userId);

    return (
        <div className={styles.dashboardGrid}>
            
            {/* --- COLUMNA IZQUIERDA (PRINCIPAL) --- */}
            <main className={styles.mainColumn}>
                <ExpenseForm 
                    onAdd={async (data) => {
                        const expenseWithDate = {
                            ...data,
                            createdAt: new Date() as any 
                        };
                        return addExpense(expenseWithDate);
                    }} 
                    onAddSubCategory={addSubCategory}
                    categories={categories}
                    isSubmitting={false}
                    expenses={expenses}
                />
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