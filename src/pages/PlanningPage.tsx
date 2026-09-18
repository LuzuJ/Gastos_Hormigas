import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer/PageContainer';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { Card } from '../components/ui/Card/Card';
import {
    useNetWorthContext,
    useSavingsGoalsContext,
    useFinancialsContext
} from '../contexts/AppContext';
import { formatCurrency } from '../utils/formatters';
import { HandCoins, Wallet, CreditCard, Target, Receipt } from 'lucide-react';
import styles from './PlanningPage.module.css';
import { AssetDetailsSheet } from '../components/modals/PlanningSheets/AssetDetailsSheet';
import { LiabilityDetailsSheet } from '../components/modals/PlanningSheets/LiabilityDetailsSheet';
import { SavingsGoalSheet } from '../components/modals/PlanningSheets/SavingsGoalSheet';
import { FixedExpensesSheet } from '../components/modals/PlanningSheets/FixedExpensesSheet';
import { FinancialTips } from '../components/dashboard/FinancialTips/FinancialTips';

type SheetType = 'assets' | 'liabilities' | 'goals' | 'fixed' | null;

export const PlanningPage: React.FC<{ isGuest?: boolean }> = ({ isGuest }) => {
    // Contexts
    const {
        netWorth, assets, liabilities, totalAssets, totalLiabilities,
        addAsset, updateAsset, deleteAsset, addLiability, updateLiability, deleteLiability
    } = useNetWorthContext();
    const {
        savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
        addAmountToGoal, subtractAmountFromGoal
    } = useSavingsGoalsContext();
    const { fixedExpenses, addFixedExpense, deleteFixedExpense } = useFinancialsContext();

    const [activeSheet, setActiveSheet] = useState<SheetType>(null);

    return (
        <PageContainer>
            <div className={styles.container}>
                <PageHeader
                    title="Planificación"
                    subtitle="Tu mapa hacia la libertad financiera"
                    icon={<HandCoins size={24} />}
                />

                {/* Net Worth - Full Width Hero */}
                <div className={styles.heroSection}>
                    <span className={styles.netWorthLabel}>Patrimonio Neto Total</span>
                    <span className={`${styles.netWorthValue} ${netWorth >= 0 ? styles.positive : styles.negative}`}>
                        {formatCurrency(netWorth)}
                    </span>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        (Activos - Pasivos)
                    </div>
                </div>

                {/* Main Sections - Vertical Stack or Grid depending on breadth */}
                {/* User asked to de-compress. Using full width cards for primary categories might be better, 
                    OR better grid spacing. Let's use a cleaner Grid with visual separation. */}

                <h3 className={styles.sectionHeader}>Balance General</h3>
                <div className={styles.grid2}>
                    <div onClick={() => setActiveSheet('assets')} style={{ cursor: 'pointer' }}>
                        <Card padding="lg" className={styles.hoverCard}>
                            <div className={styles.sectionTitle}>
                                <div className={styles.iconCircle} style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)' }}>
                                    <Wallet size={20} />
                                </div>
                                Activos
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
                                {formatCurrency(totalAssets)}
                            </div>
                            <div className={styles.cardFooter}>
                                {assets.length} activos registrados
                                <span className={styles.arrow}>&rarr;</span>
                            </div>
                        </Card>
                    </div>

                    <div onClick={() => setActiveSheet('liabilities')} style={{ cursor: 'pointer' }}>
                        <Card padding="lg" className={styles.hoverCard}>
                            <div className={styles.sectionTitle}>
                                <div className={styles.iconCircle} style={{ background: 'rgba(var(--danger-rgb), 0.1)', color: 'var(--danger)' }}>
                                    <CreditCard size={20} />
                                </div>
                                Pasivos
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>
                                -{formatCurrency(totalLiabilities)}
                            </div>
                            <div className={styles.cardFooter}>
                                {liabilities.length} deudas registradas
                                <span className={styles.arrow}>&rarr;</span>
                            </div>
                        </Card>
                    </div>
                </div>

                <h3 className={styles.sectionHeader}>Metas y Compromisos</h3>
                <div className={styles.grid2}>
                    <div onClick={() => setActiveSheet('goals')} style={{ cursor: 'pointer' }}>
                        <Card padding="lg" className={styles.hoverCard}>
                            <div className={styles.sectionTitle}>
                                <div className={styles.iconCircle} style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                                    <Target size={20} />
                                </div>
                                Metas de Ahorro
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {savingsGoals.length}
                            </div>
                            <div className={styles.cardFooter}>
                                Metas activas
                                <span className={styles.arrow}>&rarr;</span>
                            </div>
                        </Card>
                    </div>

                    <div onClick={() => setActiveSheet('fixed')} style={{ cursor: 'pointer' }}>
                        <Card padding="lg" className={styles.hoverCard}>
                            <div className={styles.sectionTitle}>
                                <div className={styles.iconCircle} style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
                                    <Receipt size={20} />
                                </div>
                                Gastos Fijos
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {fixedExpenses.length}
                            </div>
                            <div className={styles.cardFooter}>
                                Recurrentes mensuales
                                <span className={styles.arrow}>&rarr;</span>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Financial Tips Section */}
                <FinancialTips />

                {/* Sheets */}
                <AssetDetailsSheet
                    isOpen={activeSheet === 'assets'}
                    onClose={() => setActiveSheet(null)}
                    assets={assets}
                    onAddAsset={addAsset}
                    onUpdateAsset={updateAsset}
                    onDeleteAsset={deleteAsset}
                />

                <LiabilityDetailsSheet
                    isOpen={activeSheet === 'liabilities'}
                    onClose={() => setActiveSheet(null)}
                    liabilities={liabilities}
                    onAddLiability={addLiability}
                    onUpdateLiability={updateLiability}
                    onDeleteLiability={deleteLiability}
                />

                <SavingsGoalSheet
                    isOpen={activeSheet === 'goals'}
                    onClose={() => setActiveSheet(null)}
                    goals={savingsGoals}
                    onAddGoal={addSavingsGoal}
                    onUpdateGoal={updateSavingsGoal}
                    onDeleteGoal={deleteSavingsGoal}
                    onAddAmount={addAmountToGoal}
                    onSubtractAmount={subtractAmountFromGoal}
                />

                <FixedExpensesSheet
                    isOpen={activeSheet === 'fixed'}
                    onClose={() => setActiveSheet(null)}
                    expenses={fixedExpenses}
                    onAddExpense={addFixedExpense}
                    onDeleteExpense={deleteFixedExpense}
                />
            </div>
        </PageContainer>
    );
};

export default PlanningPage;
