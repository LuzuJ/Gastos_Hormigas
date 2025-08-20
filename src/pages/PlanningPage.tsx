import React from 'react';
import { IncomeForm } from '../components/IncomeForm/IncomeForm';
import { FixedExpenses } from '../components/FixedExpenses/FixedExpenses';
import { NetWorthManager } from '../components/NetWorthManager/NetWorthManager';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { NetWorthSection } from '../components/PlanningPage/NetWorthSection';
import { SavingsGoalsSection } from '../components/PlanningPage/SavingsGoalsSection';
import { DebtManagerSection } from '../components/PlanningPage/DebtManagerSection';
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
            
            {!isGuest && (
                <div className={styles.section}>
                    <NetWorthSection
                        totalAssets={totalAssets}
                        totalLiabilities={totalLiabilities}
                        netWorth={netWorth}
                        loading={loadingNetWorth}
                        error={netWorthError}
                        onDismissError={clearNetWorthError}
                    />
                </div>
            )}
            
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
                    retryButtonText="Reintentar Carga de Planificación"
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
                            <DebtManagerSection
                                liabilities={liabilities}
                                onAddLiability={addLiability}
                                onUpdateLiability={updateLiability}
                                onDeleteLiability={deleteLiability}
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
                        
                        <div className={styles.section}>
                            <SavingsGoalsSection
                                savingsGoals={savingsGoals}
                                onAdd={addSavingsGoal}
                                onDelete={deleteSavingsGoal}
                                onAddFunds={addToSavingsGoal}
                                onRemoveFunds={removeFromSavingsGoal}
                                loading={loadingSavingsGoals}
                                error={savingsGoalsError}
                                onDismissError={clearSavingsGoalsError}
                                isGuest={isGuest}
                            />
                        </div>
                    </>
                </LoadingStateWrapper>
            )}
        </div>
    );
};
