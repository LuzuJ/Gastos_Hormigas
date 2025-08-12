import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { SavingsGoals } from '../components/SavingsGoals/SavingsGoals';
import { useExpensesController } from '../hooks/useExpensesController';

interface PlanningPageProps {
  userId: string | null;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ userId }) => {
    const { 
      financials, setMonthlyIncome, error,
      categories, fixedExpenses, addFixedExpense, deleteFixedExpense, 
      savingsGoals, addSavingsGoal, deleteSavingsGoal, addToSavingsGoal
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
                categories={categories} 
                fixedExpenses={fixedExpenses}
                onAdd={addFixedExpense}
                onDelete={deleteFixedExpense}
              />
            </div>
            <SavingsGoals 
              savingsGoals={savingsGoals}
              onAdd={addSavingsGoal}
              onDelete={deleteSavingsGoal}
              onAddFunds={addToSavingsGoal}
            />
            
        </div>

    );
};
