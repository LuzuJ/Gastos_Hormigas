import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { useExpensesController } from '../hooks/useExpensesController';

const defaultCategories = [
  { id: 'default-1', name: 'Alimento' }, { id: 'default-2', name: 'Transporte' },
  { id: 'default-3', name: 'Entretenimiento' }, { id: 'default-4', name: 'Hogar' },
  { id: 'default-5', name: 'Salud' }, { id: 'default-6', name: 'Otro' }
];

interface PlanningPageProps {
  userId: string | null;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ userId }) => {
    const { 
      financials, setMonthlyIncome, error,
      categories, fixedExpenses, addFixedExpense, deleteFixedExpense 
    } = useExpensesController(userId);
    
    const allCategories = [...defaultCategories, ...categories];

    return (
        <div>
            <h2 className="section-title">Planificación Financiera</h2>
            {error && <p className="error-message">{error}</p>}
            
            <IncomeForm
                currentIncome={financials?.monthlyIncome || 0}
                onSetIncome={setMonthlyIncome}
            />

            <div style={{ marginTop: '2rem' }}>
              <FixedExpenses 
                categories={allCategories}
                fixedExpenses={fixedExpenses}
                onAdd={addFixedExpense}
                onDelete={deleteFixedExpense}
              />
            </div>
        </div>
    );
};
