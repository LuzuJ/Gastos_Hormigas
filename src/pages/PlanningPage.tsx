import React, { useState, useMemo } from 'react';
import { ChevronDown, Plus, Wallet, CreditCard, Target, PiggyBank, Receipt, TrendingUp } from 'lucide-react';
import { FixedExpenses } from '../components/features/fixed-expenses/FixedExpenses/FixedExpenses';
import { NetWorthManager } from '../components/features/financials/NetWorthManager/NetWorthManager';
import { GuestBlockedFeature } from '../components/misc/GuestBlockedFeature/GuestBlockedFeature';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { SavingsGoalsSection } from '../components/pages/PlanningPage/SavingsGoalsSection';
import { DebtManagerSection } from '../components/pages/PlanningPage/DebtManagerSection';
import { Modal } from '../components/ui/Modal';
import { IncomeForm } from '../components/forms/IncomeForm/IncomeForm';
import {
    useCategoriesContext,
    useFinancialsContext,
    useSavingsGoalsContext,
    useNetWorthContext
} from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useIncomes } from '../hooks/incomes/useIncomes';
import { formatCurrency } from '../utils/formatters';
import styles from './PlanningPage.module.css';

export interface PlanningPageProps {
    isGuest: boolean;
}

type AccordionSection = 'deudas' | 'gastosFijos' | 'metas' | 'ingresos' | null;

export const PlanningPage: React.FC<PlanningPageProps> = ({ isGuest }) => {
    const [openSection, setOpenSection] = useState<AccordionSection>(null);
    const [showIncomeModal, setShowIncomeModal] = useState(false);

    const { user } = useAuth();

    // Hook para obtener ingresos reales
    const { incomes, loading: loadingIncomes } = useIncomes(user?.id || null);

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
        addAmountToGoal,
        subtractAmountFromGoal,
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

    const isLoadingCritical = loadingCategories || loadingFinancials || loadingIncomes;
    const criticalError = categoriesError || financialsError;

    // Calcular ingresos del mes actual
    const monthlyIncomeFromRecords = useMemo(() => {
        if (!incomes || incomes.length === 0) return 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return incomes
            .filter(income => {
                const incomeDate = new Date(income.date);
                return incomeDate >= startOfMonth && incomeDate <= now;
            })
            .reduce((sum, income) => sum + income.amount, 0);
    }, [incomes]);

    // Usar el mayor entre manual y calculado
    const displayIncome = Math.max(financials?.monthlyIncome || 0, monthlyIncomeFromRecords);

    const toggleSection = (section: AccordionSection) => {
        setOpenSection(openSection === section ? null : section);
    };

    if (isGuest) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>📊 Planificación Financiera</h2>
                </div>
                <div className={styles.section}>
                    <GuestBlockedFeature message="Gestiona tus activos, pasivos, gastos fijos y metas de ahorro creando una cuenta." />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>📊 Planificación Financiera</h2>
            </div>

            {/* Hero - Patrimonio Neto */}
            <div className={styles.netWorthHero}>
                <div className={styles.netWorthLabel}>Patrimonio Neto</div>
                <div className={`${styles.netWorthValue} ${netWorth >= 0 ? styles.positive : styles.negative}`}>
                    {formatCurrency(netWorth)}
                </div>
            </div>

            {/* Grid 2 columnas: Activos | Pasivos */}
            <div className={styles.mainGrid}>
                {/* Activos */}
                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>
                            <Wallet size={18} /> Activos
                        </span>
                        <span className={`${styles.cardTotal} ${styles.positive}`}>
                            {formatCurrency(totalAssets)}
                        </span>
                    </div>
                    <div className={styles.itemList}>
                        {assets.length === 0 ? (
                            <div className={styles.emptyState}>Sin activos registrados</div>
                        ) : (
                            assets.map(asset => (
                                <div key={asset.id} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{asset.name}</span>
                                        <span className={styles.itemType}>{asset.type}</span>
                                    </div>
                                    <span className={`${styles.itemValue} ${styles.positive}`}>
                                        +{formatCurrency(asset.value)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pasivos */}
                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>
                            <CreditCard size={18} /> Pasivos
                        </span>
                        <span className={`${styles.cardTotal} ${styles.negative}`}>
                            -{formatCurrency(totalLiabilities)}
                        </span>
                    </div>
                    <div className={styles.itemList}>
                        {liabilities.length === 0 ? (
                            <div className={styles.emptyState}>Sin pasivos registrados</div>
                        ) : (
                            liabilities.map(liability => (
                                <div key={liability.id} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{liability.name}</span>
                                        <span className={styles.itemType}>{liability.type}</span>
                                    </div>
                                    <span className={`${styles.itemValue} ${styles.negative}`}>
                                        -{formatCurrency(liability.amount ?? 0)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <LoadingStateWrapper
                loading={isLoadingCritical}
                error={criticalError}
                onDismissError={() => {
                    clearCategoriesError();
                    clearFinancialsError();
                }}
                loadingMessage="Cargando datos..."
            >
                <>
                    {/* Gestión Activos/Pasivos - Acordeón */}
                    <div className={styles.accordion}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() => toggleSection('deudas')}
                        >
                            <span className={styles.accordionTitle}>
                                <CreditCard size={18} /> Gestionar Activos y Deudas
                            </span>
                            <ChevronDown
                                size={18}
                                className={`${styles.accordionChevron} ${openSection === 'deudas' ? styles.open : ''}`}
                            />
                        </button>
                        {openSection === 'deudas' && (
                            <div className={styles.accordionContent}>
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
                        )}
                    </div>

                    {/* Gastos Fijos - Acordeón */}
                    <div className={styles.accordion}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() => toggleSection('gastosFijos')}
                        >
                            <span className={styles.accordionTitle}>
                                <Receipt size={18} /> Gastos Fijos Mensuales
                            </span>
                            <ChevronDown
                                size={18}
                                className={`${styles.accordionChevron} ${openSection === 'gastosFijos' ? styles.open : ''}`}
                            />
                        </button>
                        {openSection === 'gastosFijos' && (
                            <div className={styles.accordionContent}>
                                <FixedExpenses
                                    categories={categories}
                                    fixedExpenses={fixedExpenses}
                                    onAdd={async (data) => { await addFixedExpense(data); }}
                                    onDelete={async (id: string) => { await deleteFixedExpense(id); }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Metas de Ahorro - Acordeón */}
                    <div className={styles.accordion}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() => toggleSection('metas')}
                        >
                            <span className={styles.accordionTitle}>
                                <Target size={18} /> Metas de Ahorro
                            </span>
                            <ChevronDown
                                size={18}
                                className={`${styles.accordionChevron} ${openSection === 'metas' ? styles.open : ''}`}
                            />
                        </button>
                        {openSection === 'metas' && (
                            <div className={styles.accordionContent}>
                                <SavingsGoalsSection
                                    savingsGoals={savingsGoals}
                                    onAdd={addSavingsGoal}
                                    onDelete={deleteSavingsGoal}
                                    onAddFunds={addAmountToGoal}
                                    onRemoveFunds={subtractAmountFromGoal}
                                    loading={loadingSavingsGoals}
                                    error={savingsGoalsError}
                                    onDismissError={clearSavingsGoalsError}
                                    isGuest={isGuest}
                                />
                            </div>
                        )}
                    </div>

                    {/* Ingreso Mensual - Acordeón */}
                    <div className={styles.accordion}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() => toggleSection('ingresos')}
                        >
                            <span className={styles.accordionTitle}>
                                <PiggyBank size={18} /> Ingreso Mensual: {formatCurrency(displayIncome)}
                                {monthlyIncomeFromRecords > 0 && (
                                    <TrendingUp size={14} style={{ color: '#10b981', marginLeft: '4px' }} />
                                )}
                            </span>
                            <ChevronDown
                                size={18}
                                className={`${styles.accordionChevron} ${openSection === 'ingresos' ? styles.open : ''}`}
                            />
                        </button>
                        {openSection === 'ingresos' && (
                            <div className={styles.accordionContent}>
                                <IncomeForm
                                    currentIncome={financials?.monthlyIncome || 0}
                                    onSetIncome={async (income: number) => {
                                        await setMonthlyIncome(income);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </>
            </LoadingStateWrapper>

            {/* Modal de Ingreso */}
            <Modal
                isOpen={showIncomeModal}
                onClose={() => setShowIncomeModal(false)}
                title="Configurar Ingreso Mensual"
            >
                <IncomeForm
                    currentIncome={financials?.monthlyIncome || 0}
                    onSetIncome={async (income: number) => {
                        await setMonthlyIncome(income);
                        setShowIncomeModal(false);
                    }}
                />
            </Modal>
        </div>
    );
};
