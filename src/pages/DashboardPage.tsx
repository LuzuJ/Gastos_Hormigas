import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList/ExpenseList';
import { Summary } from '../components/Summary/Summary';
import { EditExpenseModal } from '../components/modals/EditExpenseModal/EditExpenseModal';
import { useExpensesController } from '../hooks/useExpensesController';

interface DashboardPageProps {
  userId: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userId }) => {
     const { 
        expenses, 
        categories, 
        loading, 
        error, 
        addExpense, 
        updateExpense, 
        deleteExpense,
        isEditing, 
        setIsEditing, 
        totalExpensesToday,
        financials, 
        totalExpensesMonth, 
        totalFixedExpenses
    } = useExpensesController(userId);

    return (
        <div>
            <ExpenseForm 
                onAdd={addExpense} 
                categories={categories}
                isSubmitting={loading} 
            />
            <Summary 
                totalToday={totalExpensesToday} 
                totalMonth={totalExpensesMonth}
                monthlyIncome={financials?.monthlyIncome || 0}
                fixedExpensesTotal={totalFixedExpenses}
            />
            
            {error && <p className="error-message">{error}</p>}

            <div style={{marginTop: '2rem'}}>
                <h2 className="section-title">Registro de Gastos</h2>
                <ExpenseList 
                    expenses={expenses} 
                    categories={categories}
                    onDelete={deleteExpense} 
                    loading={loading}
                    onEdit={(expense) => setIsEditing(expense)} 
                />
            </div>
            
            {isEditing && (
                <EditExpenseModal
                    expense={isEditing}
                    categories={categories}
                    onClose={() => setIsEditing(null)}
                    onSave={updateExpense}
                />
            )}
        </div>
    );
};
