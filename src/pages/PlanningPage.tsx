import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { SavingsGoals } from '../components/SavingsGoals/SavingsGoals';
import { NetWorthSummary } from '../components/NetWorthSummary/NetWorthSummary';
import { NetWorthManager } from '../components/NetWorthManager/NetWorthManager';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';
import {
    useCategoriesContext,
    useFinancialsContext,
    useSavingsGoalsContext,
    useNetWorthContext
} from '../contexts/AppContext';
import styles from './PlanningPage.module.css';

export interface PlanningPageProps {
    isGuest: boolean;
}

export const PlanningPage: React.FC<PlanningPageProps> = ({ isGuest }) => {
    const { categories } = useCategoriesContext();
    const { 
        financials, 
        setMonthlyIncome, 
        fixedExpenses, 
        addFixedExpense, 
        deleteFixedExpense 
    } = useFinancialsContext();
    const { 
        savingsGoals, 
        addSavingsGoal, 
        deleteSavingsGoal, 
        addToSavingsGoal,
        removeFromSavingsGoal 
    } = useSavingsGoalsContext();
    const { 
        assets, 
        liabilities, 
        netWorth, 
        totalAssets, 
        totalLiabilities,
        addAsset, 
        deleteAsset, 
        addLiability, 
        deleteLiability 
    } = useNetWorthContext();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={`section-title ${styles.title}`}>Planificación Financiera</h2>
            </div>
            
            <div className={styles.section}>
                <NetWorthSummary 
                    totalAssets={totalAssets}
                    totalLiabilities={totalLiabilities}
                    netWorth={netWorth}
                />
            </div>
            
            {isGuest ? (
                <div className={styles.section}>
                    <GuestBlockedFeature message="Gestiona tus activos, pasivos, gastos fijos y metas de ahorro creando una cuenta." />
                </div>
            ) : (
                <>
                    <div className={styles.section}>
                        <NetWorthManager
                            assets={assets}
                            liabilities={liabilities}
                            onAddAsset={addAsset}
                            onDeleteAsset={deleteAsset}
                            onAddLiability={addLiability}
                            onDeleteLiability={deleteLiability}
                        />
                    </div>

                    <div className={styles.section}>
                        <IncomeForm
                            currentIncome={financials?.monthlyIncome || 0}
                            onSetIncome={setMonthlyIncome}
                        />
                    </div>

                    <div className={styles.section}>
                        <FixedExpenses 
                            categories={categories} 
                            fixedExpenses={fixedExpenses}
                            onAdd={addFixedExpense}
                            onDelete={deleteFixedExpense}
                        />
                    </div>
                    
                    <div className={styles.section}>
                        <SavingsGoals 
                            savingsGoals={savingsGoals}
                            onAdd={addSavingsGoal}
                            onDelete={deleteSavingsGoal}
                            onAddFunds={addToSavingsGoal}
                            onRemoveFunds={removeFromSavingsGoal}
                            isGuest={isGuest}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
