import React from 'react';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList/ExpenseList';
import { Summary } from '../components/Summary/Summary';
import { EditExpenseModal } from '../components/modals/EditExpenseModal/EditExpenseModal';
import { useExpensesController } from '../hooks/useExpensesController';

// Definimos las categorías por defecto que todos los usuarios tendrán
const defaultCategories = [
  { id: 'default-1', name: 'Alimento' }, { id: 'default-2', name: 'Transporte' },
  { id: 'default-3', name: 'Entretenimiento' }, { id: 'default-4', name: 'Hogar' },
  { id: 'default-5', name: 'Salud' }, { id: 'default-6', name: 'Otro' }
];

interface DashboardPageProps {
  userId: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userId }) => {
    const { 
        expenses, categories, loading, error, 
        addExpense, updateExpense, deleteExpense,
        isEditing, setIsEditing, totalExpensesToday,
        financials, totalExpensesMonth, totalFixedExpenses
    } = useExpensesController(userId);

    // Combinamos las categorías por defecto con las personalizadas del usuario
    const allCategories = [...defaultCategories, ...categories];

    return (
        <div>
            <ExpenseForm 
                onAdd={addExpense} 
                categories={allCategories}
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
                    onDelete={deleteExpense} 
                    loading={loading}
                    onEdit={(expense) => setIsEditing(expense)} 
                />
            </div>
            
            {isEditing && (
                <EditExpenseModal
                    expense={isEditing}
                    categories={allCategories}
                    onClose={() => setIsEditing(null)}
                    onSave={updateExpense}
                />
            )}
        </div>
    );
};