import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { SavingsGoals } from '../components/SavingsGoals/SavingsGoals';
import { useExpensesController } from '../hooks/useExpensesController';
import { NetWorthSummary } from '../components/NetWorthSummary/NetWorthSummary';
import { NetWorthManager } from '../components/NetWorthManager/NetWorthManager';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature'; // 1. Importar
import styles from './PlanningPage.module.css';

export interface PlanningPageProps {
    userId: string | null;
    isGuest: boolean;
}
export const PlanningPage: React.FC<PlanningPageProps> = ({ userId, isGuest }) => {
    const { 
      financials, setMonthlyIncome, error,
      categories, fixedExpenses, addFixedExpense, deleteFixedExpense, 
      savingsGoals, addSavingsGoal, deleteSavingsGoal, addToSavingsGoal,
      assets, liabilities, netWorth, totalAssets, totalLiabilities,
      addAsset, deleteAsset, addLiability, deleteLiability, removeFromSavingsGoal
    } = useExpensesController(userId);

    return (
        <div className={styles.container}>
            <h2 className={`section-title ${styles.title}`}>Planificación Financiera</h2>
          
            <NetWorthSummary 
              totalAssets={totalAssets}
              totalLiabilities={totalLiabilities}
              netWorth={netWorth}
            />

            {error && <p className="error-message">{error}</p>}
            
            {isGuest ? (
                <GuestBlockedFeature message="Gestiona tus activos, pasivos, gastos fijos y metas de ahorro creando una cuenta." />
            ) : (
                <>
                    <NetWorthManager
                        assets={assets}
                        liabilities={liabilities}
                        onAddAsset={addAsset}
                        onDeleteAsset={deleteAsset}
                        onAddLiability={addLiability}
                        onDeleteLiability={deleteLiability}
                    />
                    
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
                      onRemoveFunds={removeFromSavingsGoal}
                    />
                </>
            )}
        </div>
    );
};