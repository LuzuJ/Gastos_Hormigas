
import React, { useState, useMemo, Suspense, lazy } from 'react';
import {
    useCategoriesContext,
    useExpensesContext,
    useCombinedCalculationsContext,
    useFinancialsContext
} from '../contexts/AppContext';
import { LoadingStateWrapper, LoadingSpinner } from '../components/LoadingState/LoadingState';
import { GuestBlockedFeature } from '../components/misc/GuestBlockedFeature/GuestBlockedFeature';
import { DonutChart } from '../components/charts/DonutChart';
import { CategoryList } from '../components/features/stats/CategoryList/CategoryList';
import { SpendingThermometer } from '../components/features/stats/SpendingThermometer/SpendingThermometer';
import { ComparativeCard } from '../components/features/stats/ComparativeCard/ComparativeCard';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Tag, GitCompare, List, Thermometer } from 'lucide-react';
import styles from './StatsPage.module.css';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { PageContainer } from '../components/layout/PageContainer/PageContainer';

// Atoms
import { Card } from '../components/ui/Card/Card';
import { StatsCard } from '../components/ui/StatsCard/StatsCard';

// Lazy load removed - ComparativeCard is lightweight
// const ComparativeChart = lazy(() => import('../components/charts/ComparativeChart/ComparativeChart'));

interface StatsPageProps {
    isGuest: boolean;
}

type PeriodFilter = 'week' | 'month' | 'year';

export const StatsPage: React.FC<StatsPageProps> = ({ isGuest }) => {
    const [period, setPeriod] = useState<PeriodFilter>('month');

    const { categories, loadingCategories, categoriesError, clearCategoriesError } = useCategoriesContext();
    const { expenses, loadingExpenses, expensesError, clearExpensesError } = useExpensesContext();
    const { monthlyExpensesTrend, comparativeExpenses } = useCombinedCalculationsContext();
    const { financials } = useFinancialsContext();

    const isLoading = loadingCategories || loadingExpenses;
    const error = categoriesError || expensesError;

    // Calcular estadísticas basadas en el período
    const stats = useMemo(() => {
        if (!expenses || expenses.length === 0) {
            return {
                totalExpenses: 0,
                averageDaily: 0,
                transactionCount: 0,
                topCategory: 'N/A',
                topCategoryAmount: 0,
                trend: 0,
                categoryData: []
            };
        }

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.createdAt || 0);
            return expDate >= startDate && expDate <= now;
        });

        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const daysDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const averageDaily = totalExpenses / daysDiff;

        const categoryTotals: Record<string, { total: number; name: string; color: string; icon: string }> = {};
        filteredExpenses.forEach(exp => {
            const category = categories.find(c => c.id === exp.categoryId);
            const categoryName = category?.name || 'Sin categoría';
            const categoryColor = category?.color || '#666';
            const categoryIcon = category?.icon || '📦';

            if (!categoryTotals[categoryName]) {
                categoryTotals[categoryName] = { total: 0, name: categoryName, color: categoryColor, icon: categoryIcon };
            }
            categoryTotals[categoryName].total += exp.amount || 0;
        });

        const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.total - a.total);
        const topCategory = sortedCategories[0]?.name || 'N/A';
        const topCategoryAmount = sortedCategories[0]?.total || 0;

        const categoryData = sortedCategories.map(cat => ({
            name: cat.name,
            amount: cat.total,
            color: cat.color,
            percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0,
            icon: cat.icon,
            // For Donut
            label: cat.name,
            value: cat.total
        }));

        const previousStart = new Date(startDate);
        previousStart.setDate(previousStart.getDate() - daysDiff);

        const previousExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.createdAt || 0);
            return expDate >= previousStart && expDate < startDate;
        });

        const previousTotal = previousExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const trend = previousTotal > 0 ? ((totalExpenses - previousTotal) / previousTotal) * 100 : 0;

        return {
            totalExpenses,
            averageDaily,
            transactionCount: filteredExpenses.length,
            topCategory,
            topCategoryAmount,
            trend,
            categoryData
        };
    }, [expenses, categories, period]);

    const income = financials?.monthlyIncome || 0;

    if (isGuest) {
        return (
            <PageContainer>
                <div className={styles.guestContainer}>
                    <GuestBlockedFeature message="Visualiza tus patrones de gasto con gráficos interactivos creando una cuenta gratuita." />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className={styles.container}>
                <LoadingStateWrapper
                    loading={isLoading}
                    error={error}
                    onDismissError={() => {
                        clearCategoriesError();
                        clearExpensesError();
                    }}
                    loadingMessage="Analizando gastos..."
                >
                    <>
                        <PageHeader
                            title="Análisis"
                            subtitle="Entiende tus hábitos"
                            icon={<TrendingUp size={24} />}
                            actions={
                                <div className={styles.filterGroup}>
                                    {(['week', 'month', 'year'] as PeriodFilter[]).map(p => (
                                        <button
                                            key={p}
                                            className={`${styles.filterBtn} ${period === p ? styles.active : ''}`}
                                            onClick={() => setPeriod(p)}
                                        >
                                            {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                                        </button>
                                    ))}
                                </div>
                            }
                        />

                        {/* 1. Spending Thermometer (Mobile Hero) */}
                        <div style={{ marginBottom: '20px' }}>
                            <SpendingThermometer
                                spent={stats.totalExpenses}
                                limit={income}
                                label={period === 'month' ? 'Ingresos Mensuales' : 'Límite Estimado'}
                            />
                        </div>

                        {/* 2. KPI Grid */}
                        <div className={styles.kpiGrid}>
                            <StatsCard
                                label="Total Gastado"
                                value={formatCurrency(stats.totalExpenses)}
                                icon={<DollarSign size={16} />}
                            />
                            <StatsCard
                                label="Promedio Diario"
                                value={formatCurrency(stats.averageDaily)}
                                icon={<Calendar size={16} />}
                            />
                            <StatsCard
                                label="Top Categoría"
                                value={stats.topCategory}
                                icon={<Tag size={16} />}
                            />
                            <StatsCard
                                label="Tendencia"
                                value={`${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(1)}%`}
                                icon={stats.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                status={stats.trend > 0 ? 'danger' : 'success'}
                            />
                        </div>

                        {/* 3. Charts & Lists Grid */}
                        <div className={styles.chartsGrid}>
                            {/* Donut Chart (Kept per request) */}
                            <Card className={styles.chartCard} padding="lg">
                                <div className={styles.chartHeader}>
                                    <Thermometer size={18} /> Distribución
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                                    <DonutChart
                                        data={stats.categoryData}
                                        size={160}
                                        thickness={30}
                                        centerValue={formatCurrency(stats.totalExpenses)}
                                        centerLabel="Total"
                                    />
                                </div>
                            </Card>

                            {/* Category List (Replaces Bar Chart) */}
                            <Card className={styles.chartCard} padding="lg">
                                <div className={styles.chartHeader}>
                                    <List size={18} /> Detalle por Categoría
                                </div>
                                <CategoryList
                                    data={stats.categoryData}
                                    total={stats.totalExpenses}
                                />
                            </Card>

                            {/* Comparative Summary (Clean List) */}
                            <Card className={`${styles.chartCard} ${styles.fullWidth}`} padding="lg">
                                <div className={styles.chartHeader}>
                                    <GitCompare size={18} /> Mes Actual vs Anterior
                                </div>
                                <ComparativeCard data={comparativeExpenses} />
                            </Card>
                        </div>
                    </>
                </LoadingStateWrapper>
            </div>
        </PageContainer>
    );
};

export default StatsPage;
