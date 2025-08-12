import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { useExpensesController } from '../hooks/useExpensesController';

interface PlanningPageProps {
  userId: string | null;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ userId }) => {
    const { 
      financials, setMonthlyIncome, error,
      categories, fixedExpenses, addFixedExpense, deleteFixedExpense 
    } = useExpensesController(userId);

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
                categories={categories} // Usamos directamente las categorías del hook
                fixedExpenses={fixedExpenses}
                onAdd={addFixedExpense}
                onDelete={deleteFixedExpense}
              />
            </div>
        </div>
    );
};
