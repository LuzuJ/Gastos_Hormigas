import React, { useMemo } from 'react';
import { HeroBalance } from '../components/dashboard/HeroBalance/HeroBalance';
import { LoadingStateWrapper } from '../components/LoadingState/LoadingState';
import { useExpensesContext, useFinancialsContext, useCategoriesContext } from '../contexts/AppContext';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { Card } from '../components/ui/Card/Card';
import { formatCurrency } from '../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';

import styles from './DashboardPage.module.css';
import { DailyWisdom } from '../components/dashboard/DailyWisdom/DailyWisdom';
import { SmartInsight } from '../components/dashboard/SmartInsight/SmartInsight';

interface DashboardPageProps {
    isGuest: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ isGuest }) => {
    const { expenses, loadingExpenses } = useExpensesContext();
    const { financials } = useFinancialsContext();
    const { categories } = useCategoriesContext();

    // Basic derivation for balance (Income - Expenses) - ideally this comes from a context or backend
    const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const monthlyIncome = financials?.monthlyIncome || 0;
    const balance = monthlyIncome - totalExpenses;

    // Group expenses by date (Today vs Yesterday vs Older)
    const groupedExpenses = useMemo(() => {
        const today = new Date().toDateString();
        const groups: Record<string, typeof expenses> = { 'Hoy': [], 'Anterior': [] };

        expenses.slice(0, 15).forEach(exp => {
            const d = new Date(exp.createdAt || Date.now()).toDateString();
            if (d === today) groups['Hoy'].push(exp);
            else groups['Anterior'].push(exp);
        });
        return groups;
    }, [expenses]);

    return (
        <div className={styles.zenContainer}>
            {/* 1. Hero Section */}
            <HeroBalance
                balance={balance}
                monthlyIncome={monthlyIncome}
            />

            {/* 0. Wisdom & Insights */}
            <DailyWisdom />
            <SmartInsight />

            {/* 2. Quick Stats Row (Simple In/Out) */}
            <div className={styles.quickStats}>
                <div className={styles.statPill}>
                    <ArrowDownLeft size={16} color="var(--success)" />
                    <span>Ingresos: {formatCurrency(monthlyIncome)}</span>
                </div>
                <div className={styles.statPill}>
                    <ArrowUpRight size={16} color="var(--danger)" />
                    <span>Gastos: {formatCurrency(totalExpenses)}</span>
                </div>
            </div>

            {/* 3. Transaction Feed */}
            <div className={styles.feedSection}>
                <h3 className={styles.sectionTitle}>Actividad Reciente</h3>

                <LoadingStateWrapper loading={loadingExpenses} error={null}>
                    <div className={styles.feedList}>
                        {Object.entries(groupedExpenses).map(([label, group]) => (
                            group.length > 0 && (
                                <div key={label} className={styles.dayGroup}>
                                    <span className={styles.dayLabel}>{label}</span>
                                    {group.map(expense => {
                                        const cat = categories.find(c => c.id === expense.categoryId);
                                        return (
                                            <div key={expense.id} className={styles.feedItem}>
                                                <div className={styles.feedIcon} style={{ background: (cat?.color || '#ccc') + '20', color: cat?.color || '#666' }}>
                                                    {cat?.icon || '📦'}
                                                </div>
                                                <div className={styles.feedContent}>
                                                    <span className={styles.feedTitle}>{cat?.name || 'Gasto'}</span>
                                                    <span className={styles.feedMeta}>{expense.description || 'Sin descripción'}</span>
                                                </div>
                                                <span className={styles.feedAmount}>
                                                    -{formatCurrency(expense.amount)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ))}

                        {expenses.length === 0 && (
                            <div className={styles.emptyState}>
                                <Calendar size={48} strokeWidth={1} />
                                <p>Sin actividad aún</p>
                            </div>
                        )}
                    </div>
                </LoadingStateWrapper>
            </div>
        </div>
    );
};