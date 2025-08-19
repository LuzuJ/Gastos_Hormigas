import React, { useState } from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { SavingsGoals } from '../components/SavingsGoals/SavingsGoals';
import { NetWorthSummary } from '../components/NetWorthSummary/NetWorthSummary';
import { NetWorthManager } from '../components/NetWorthManager/NetWorthManager';
import DebtManager from '../components/DebtManager/DebtManager';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
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
    const [monthlyExtraBudget, setMonthlyExtraBudget] = useState(0);
    
    const { 
        categories, 
        loadingCategories, 
        categoriesError, 
        clearCategoriesError 
    } = useCategoriesContext();
    const { 
        financials, 
        setMonthlyIncome, 
        fixedExpenses, 
        addFixedExpense, 
        deleteFixedExpense,
        loadingFinancials,
        financialsError,
        clearFinancialsError
    } = useFinancialsContext();
    const { 
        savingsGoals, 
        addSavingsGoal, 
        deleteSavingsGoal, 
        addToSavingsGoal,
        removeFromSavingsGoal,
        loadingSavingsGoals,
        savingsGoalsError,
        clearSavingsGoalsError
    } = useSavingsGoalsContext();
    const { 
        assets, 
        liabilities, 
        netWorth, 
        totalAssets, 
        totalLiabilities,
        addAsset, 
        updateAsset,
        deleteAsset, 
        addLiability, 
        updateLiability,
        deleteLiability,
        makeDebtPayment,
        getDebtAnalysis,
        loadingNetWorth,
        netWorthError,
        clearNetWorthError
    } = useNetWorthContext();

    // Estados críticos que bloquean funcionalidad principal
    const isLoadingCritical = loadingCategories || loadingFinancials;
    const criticalError = categoriesError || financialsError;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={`section-title ${styles.title}`}>Planificación Financiera</h2>
            </div>
            
            <LoadingStateWrapper
                loading={loadingNetWorth}
                error={netWorthError}
                onDismissError={clearNetWorthError}
                loadingMessage="Cargando datos de patrimonio..."
            >
                <div className={styles.section}>
                    <NetWorthSummary 
                        totalAssets={totalAssets}
                        totalLiabilities={totalLiabilities}
                        netWorth={netWorth}
                    />
                </div>
            </LoadingStateWrapper>
            
            {isGuest ? (
                <div className={styles.section}>
                    <GuestBlockedFeature message="Gestiona tus activos, pasivos, gastos fijos y metas de ahorro creando una cuenta." />
                </div>
            ) : (
                <LoadingStateWrapper
                    loading={isLoadingCritical}
                    error={criticalError}
                    onDismissError={() => {
                        clearCategoriesError();
                        clearFinancialsError();
                    }}
                    loadingMessage="Cargando datos de planificación..."
                >
                    <>
                        <div className={styles.section}>
                            <NetWorthManager
                                assets={assets}
                                liabilities={liabilities}
                                onAddAsset={addAsset}
                                onUpdateAsset={updateAsset}
                                onDeleteAsset={deleteAsset}
                                onAddLiability={addLiability}
                                onUpdateLiability={updateLiability}
                                onDeleteLiability={deleteLiability}
                            />
                        </div>

                        <div className={styles.section}>
                            <DebtManager
                                liabilities={liabilities}
                                onAddLiability={addLiability}
                                onDeleteLiability={deleteLiability}
                                onUpdateLiability={updateLiability}
                                onMakePayment={makeDebtPayment}
                                getDebtAnalysis={getDebtAnalysis}
                                monthlyExtraBudget={monthlyExtraBudget}
                                onUpdateExtraBudget={setMonthlyExtraBudget}
                            />
                        </div>

                        <div className={styles.section}>
                            <IncomeForm
                                currentIncome={financials?.monthlyIncome || 0}
                                onSetIncome={async (income: number) => {
                                    await setMonthlyIncome(income);
                                }}
                            />
                        </div>

                        <div className={styles.section}>
                            <FixedExpenses 
                                categories={categories} 
                                fixedExpenses={fixedExpenses}
                                onAdd={async (data) => { await addFixedExpense(data); }}
                                onDelete={async (id: string) => { await deleteFixedExpense(id); }}
                            />
                        </div>
                        
                        <LoadingStateWrapper
                            loading={loadingSavingsGoals}
                            error={savingsGoalsError}
                            onDismissError={clearSavingsGoalsError}
                            loadingMessage="Cargando metas de ahorro..."
                        >
                            <div className={styles.section}>
                                <SavingsGoals 
                                    savingsGoals={savingsGoals}
                                    onAdd={addSavingsGoal}
                                    onDelete={async (id: string) => { await deleteSavingsGoal(id); }}
                                    onAddFunds={addToSavingsGoal}
                                    onRemoveFunds={removeFromSavingsGoal}
                                    isGuest={isGuest}
                                />
                            </div>
                        </LoadingStateWrapper>
                    </>
                </LoadingStateWrapper>
            )}
        </div>
    );
};
