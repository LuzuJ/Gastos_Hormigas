import React, { useState, useMemo, Suspense, lazy } from 'react';
import {
    useCategoriesContext,
    useExpensesContext,
    useCombinedCalculationsContext
} from '../contexts/AppContext';
import { LoadingStateWrapper, LoadingSpinner } from '../components/LoadingState/LoadingState';
import { GuestBlockedFeature } from '../components/misc/GuestBlockedFeature/GuestBlockedFeature';
import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Tag, Target, GitCompare } from 'lucide-react';
import styles from './StatsPage.module.css';

// Lazy load de gráfico pesado
const ComparativeChart = lazy(() => import('../components/charts/ComparativeChart/ComparativeChart').then(module => ({ default: module.ComparativeChart })));

interface StatsPageProps {
    isGuest: boolean;
}

type PeriodFilter = 'week' | 'month' | 'year';

export const StatsPage: React.FC<StatsPageProps> = ({ isGuest }) => {
    const [period, setPeriod] = useState<PeriodFilter>('month');

    const { categories, loadingCategories, categoriesError, clearCategoriesError } = useCategoriesContext();
    const { expenses, loadingExpenses, expensesError, clearExpensesError } = useExpensesContext();
    const { monthlyExpensesTrend, comparativeExpenses } = useCombinedCalculationsContext();

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
                categoryData: [],
                barData: []
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

        // Filtrar gastos por período
        const filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.createdAt || 0);
            return expDate >= startDate && expDate <= now;
        });

        // Total y promedio
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const daysDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const averageDaily = totalExpenses / daysDiff;

        // Gastos por categoría
        const categoryTotals: Record<string, { total: number; name: string; color: string }> = {};
        filteredExpenses.forEach(exp => {
            const category = categories.find(c => c.id === exp.categoryId);
            const categoryName = category?.name || 'Sin categoría';
            const categoryColor = category?.color || '#666';

            if (!categoryTotals[categoryName]) {
                categoryTotals[categoryName] = { total: 0, name: categoryName, color: categoryColor };
            }
            categoryTotals[categoryName].total += exp.amount || 0;
        });

        // Ordenar categorías por cantidad
        const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.total - a.total);
        const topCategory = sortedCategories[0]?.name || 'N/A';
        const topCategoryAmount = sortedCategories[0]?.total || 0;

        // Datos para gráficos
        const categoryData = sortedCategories.slice(0, 6).map(cat => ({
            label: cat.name,
            value: cat.total,
            color: cat.color
        }));

        const barData = sortedCategories.slice(0, 5).map(cat => ({
            label: cat.name,
            value: cat.total,
            color: cat.color
        }));

        // Calcular tendencia (comparar con período anterior)
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
            categoryData,
            barData
        };
    }, [expenses, categories, period]);

    // Datos para gráfico de tendencia mensual
    const trendData = useMemo(() => {
        if (!monthlyExpensesTrend || monthlyExpensesTrend.length === 0) return [];

        return monthlyExpensesTrend.slice(-6).map(item => ({
            label: item.name,
            value: item.total,
            color: '#3b82f6'
        }));
    }, [monthlyExpensesTrend]);

    if (isGuest) {
        return (
            <div className={styles.container}>
                <h2 className="section-title">Estadísticas</h2>
                <GuestBlockedFeature message="Visualiza tus patrones de gasto con gráficos interactivos creando una cuenta gratuita." />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <LoadingStateWrapper
                loading={isLoading}
                error={error}
                onDismissError={() => {
                    clearCategoriesError();
                    clearExpensesError();
                }}
                loadingMessage="Cargando estadísticas..."
            >
                <>
                    {/* Header con filtros */}
                    <div className={styles.header}>
                        <div>
                            <h2 className={styles.title}>📊 Estadísticas</h2>
                            <p className={styles.subtitle}>Visualiza tus patrones de gasto</p>
                        </div>
                        <div className={styles.filterGroup}>
                            <button
                                className={`${styles.filterBtn} ${period === 'week' ? styles.active : ''}`}
                                onClick={() => setPeriod('week')}
                            >
                                Semana
                            </button>
                            <button
                                className={`${styles.filterBtn} ${period === 'month' ? styles.active : ''}`}
                                onClick={() => setPeriod('month')}
                            >
                                Mes
                            </button>
                            <button
                                className={`${styles.filterBtn} ${period === 'year' ? styles.active : ''}`}
                                onClick={() => setPeriod('year')}
                            >
                                Año
                            </button>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
                                <DollarSign size={20} />
                            </div>
                            <div className={styles.kpiContent}>
                                <span className={styles.kpiValue}>{formatCurrency(stats.totalExpenses)}</span>
                                <span className={styles.kpiLabel}>Total Gastado</span>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon} style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                <Calendar size={20} />
                            </div>
                            <div className={styles.kpiContent}>
                                <span className={styles.kpiValue}>{formatCurrency(stats.averageDaily)}</span>
                                <span className={styles.kpiLabel}>Promedio Diario</span>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                                <Tag size={20} />
                            </div>
                            <div className={styles.kpiContent}>
                                <span className={styles.kpiValue}>{stats.topCategory}</span>
                                <span className={styles.kpiLabel}>Categoría Top</span>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon} style={{
                                background: stats.trend >= 0
                                    ? 'linear-gradient(135deg, #ef4444, #f87171)'
                                    : 'linear-gradient(135deg, #10b981, #34d399)'
                            }}>
                                {stats.trend >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <div className={styles.kpiContent}>
                                <span className={`${styles.kpiValue} ${stats.trend >= 0 ? styles.negative : styles.positive}`}>
                                    {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
                                </span>
                                <span className={styles.kpiLabel}>vs Período Anterior</span>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos principales */}
                    <div className={styles.chartsGrid}>
                        {/* Distribución por categoría */}
                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>
                                <Target size={18} />
                                Distribución de Gastos
                            </h3>
                            <DonutChart
                                data={stats.categoryData}
                                size={180}
                                thickness={40}
                                centerValue={formatCurrency(stats.totalExpenses)}
                                centerLabel="Total"
                            />
                        </div>

                        {/* Top categorías */}
                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>
                                <TrendingUp size={18} />
                                Gastos por Categoría
                            </h3>
                            <BarChart
                                data={stats.barData}
                                maxBars={5}
                                showValues={true}
                            />
                        </div>

                        {/* Tendencia mensual */}
                        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                            <h3 className={styles.chartTitle}>
                                <Calendar size={18} />
                                Tendencia Mensual (últimos 6 meses)
                            </h3>
                            <BarChart
                                data={trendData}
                                maxBars={6}
                                showValues={true}
                            />
                        </div>

                        {/* Comparativa Mensual */}
                        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                            <h3 className={styles.chartTitle}>
                                <GitCompare size={18} />
                                Comparativa: Mes Actual vs Anterior
                            </h3>
                            <Suspense fallback={<LoadingSpinner message="Cargando comparativa..." />}>
                                <ComparativeChart data={comparativeExpenses} />
                            </Suspense>
                        </div>
                    </div>

                    {/* Resumen rápido */}
                    <div className={styles.summary}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Transacciones registradas:</span>
                            <span className={styles.summaryValue}>{stats.transactionCount}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Mayor gasto en:</span>
                            <span className={styles.summaryValue}>{stats.topCategory} ({formatCurrency(stats.topCategoryAmount)})</span>
                        </div>
                    </div>
                </>
            </LoadingStateWrapper>
        </div>
    );
};

export default StatsPage;
