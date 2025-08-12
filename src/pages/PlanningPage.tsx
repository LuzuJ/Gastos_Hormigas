import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { SavingsGoals } from '../components/SavingsGoals/SavingsGoals';
import { useExpensesController } from '../hooks/useExpensesController';


export interface PlanningPageProps {
    userId: string | null;
    isGuest: boolean;
}
export const PlanningPage: React.FC<PlanningPageProps> = ({ userId, isGuest }) => {
    const { 
      financials, setMonthlyIncome, error,
      categories, fixedExpenses, addFixedExpense, deleteFixedExpense, 
      savingsGoals, addSavingsGoal, deleteSavingsGoal, addToSavingsGoal,
    } = useExpensesController(userId);

    return (
        <div>
            <h2 className="section-title">Planificación Financiera</h2>
            {error && <p className="error-message">{error}</p>}
            {isGuest && (
              <div className="guest-warning">
                <p>Estás en modo invitado. Para guardar tus metas y gastos fijos de forma permanente, por favor, crea una cuenta.</p>
              </div>
            )}
            
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
            isGuest={isGuest}
              savingsGoals={savingsGoals}
              onAdd={addSavingsGoal}
              onDelete={deleteSavingsGoal}
              onAddFunds={addToSavingsGoal}
            />
            
        </div>

    );
};
