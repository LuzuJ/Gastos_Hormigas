import React, { useState, useMemo, Suspense } from 'react';
import { useExpensesContext, useCategoriesContext, useCombinedCalculationsContext } from '../contexts/AppContext';
import { ReportsFilter, type ReportsFilterState } from '../components/features/reports/ReportsFilter/ReportsFilter';
import { useReportsFilter } from '../hooks/financials/useReportsFilter';
// import GastosHormigaAnalysis from '../components/features/expenses/GastosHormigaAnalysis/GastosHormigaAnalysis'; // Movido a tab/sección si se necesita, pero el foco son los gráficos
import styles from './ReportsPage.module.css';
import { GuestBlockedFeature } from '../components/misc/GuestBlockedFeature/GuestBlockedFeature';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { BarChart as BarChartIcon, PieChart, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

// Charts
import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
// Lazy load comparative chart
const ComparativeChart = React.lazy(() => import('../components/charts/ComparativeChart/ComparativeChart').then(m => ({ default: m.ComparativeChart })));

// Loading
import { LoadingStateWrapper, LoadingSpinner } from '../components/LoadingState/LoadingState';

export const ReportsPage: React.FC<{ isGuest: boolean }> = ({ isGuest }) => {
    const [filterState, setFilterState] = useState<ReportsFilterState>({
        period: 'thisMonth',
        dateRange: { startDate: null, endDate: null },
        selectedCategoryId: 'all'
    });

    const { expenses, loadingExpenses, expensesError, clearExpensesError } = useExpensesContext();
    const { categories, loadingCategories } = useCategoriesContext();
    const { comparativeExpenses } = useCombinedCalculationsContext();

    const { filteredExpenses, totalAmount, categoryCount, dateRangeLabel } = useReportsFilter({
        expenses,
        categories,
        filterPeriod: filterState.period,
        dateRange: filterState.dateRange,
        selectedCategoryId: filterState.selectedCategoryId
    });

    // --- Data Preparation for Charts ---

    // 1. Category Distribution (Donut)
    const categoryDistributionData = useMemo(() => {
        const distribution: Record<string, { value: number; color: string }> = {};

        filteredExpenses.forEach(exp => {
            const cat = categories.find(c => c.id === exp.categoryId);
            const name = cat ? cat.name : 'Sin Categoría';
            const color = cat ? cat.color : '#cbd5e1';

            if (!distribution[name]) {
                distribution[name] = { value: 0, color: color || '#cbd5e1' };
            }
            distribution[name].value += exp.amount;
        });

        return Object.entries(distribution)
            .map(([label, { value, color }]) => ({ label, value, color }))
            .sort((a, b) => b.value - a.value); // Sort desc
    }, [filteredExpenses, categories]);

    // 2. Daily Trend (Bar)
    const dailyTrendData = useMemo(() => {
        const trend: Record<string, number> = {};

        filteredExpenses.forEach(exp => {
            // Simple date grouping YYYY-MM-DD
            if (!exp.createdAt) return;
            const date = new Date(exp.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            trend[date] = (trend[date] || 0) + exp.amount;
        });

        // Limit to reasonable number of bars if too many days (e.g. year view)
        // For now returning last 15 periods found or sorted by date
        return Object.entries(trend)
            .map(([label, value]) => ({ label, value, color: '#6366f1' })) // Primary accent color
            .sort((a, b) => { // Rough sort by date string (DD/MM) works for same year mostly, but ideal is ISO key
                return 0; // Keeping input order usually roughly chronological if source is
            });
        // Better: If useReportsFilter returns sorted expenses, iterating them keeps order. 
        // Assuming expenses are sorted.
    }, [filteredExpenses]);


    const handleFilterChange = (newState: ReportsFilterState) => {
        setFilterState(newState);
    };

    const handleFilterReset = () => {
        setFilterState({
            period: 'thisMonth',
            dateRange: { startDate: null, endDate: null },
            selectedCategoryId: 'all'
        });
    };

    if (isGuest) {
        return (
            <div className={styles.container}>
                <PageHeader
                    title="Reportes Avanzados"
                    subtitle="Analiza tu comportamiento financiero en detalle."
                    icon={<BarChartIcon size={28} />}
                />
                <GuestBlockedFeature message="Desbloquea reportes detallados, gráficos de tendencia y exportación de datos." />
            </div>
        );
    }

    const isLoading = loadingExpenses || loadingCategories;

    return (
        <div className={styles.container}>
            <PageHeader
                title="Reportes y Análisis"
                subtitle="Visualiza dónde se va tu dinero con gráficos interactivos."
                icon={<PieChart size={32} />}
            />

            <LoadingStateWrapper
                loading={isLoading}
                error={expensesError}
                onDismissError={clearExpensesError}
                loadingMessage="Calculando métricas..."
            >
                <div>
                    {/* Filtros */}
                    <div className={styles.filtersSection}>
                        <ReportsFilter
                            filterState={filterState}
                            onFilterChange={handleFilterChange}
                            categories={categories}
                            onReset={handleFilterReset}
                        />
                    </div>

                    {/* Resumen KPI del filtro actual */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Total en este periodo</span>
                            <span className={styles.statValue}>${totalAmount.toLocaleString()}</span>
                            <span className={styles.statSubtext}>{filteredExpenses.length} transacciones</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Promedio por gasto</span>
                            <span className={styles.statValue}>
                                ${filteredExpenses.length > 0 ? (totalAmount / filteredExpenses.length).toFixed(0) : '0'}
                            </span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Categorías activas</span>
                            <span className={styles.statValue}>{categoryCount}</span>
                        </div>
                    </div>

                    {/* Gráficos */}
                    {filteredExpenses.length > 0 ? (
                        <div className={styles.chartsGrid}>
                            {/* Donut: Distribución */}
                            <div className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <PieChart size={18} />
                                    <h3>Distribución por Categoría</h3>
                                </div>
                                <div className={styles.chartContent}>
                                    <DonutChart
                                        data={categoryDistributionData}
                                        size={220}
                                        thickness={40}
                                        centerValue={`$${totalAmount.toLocaleString()}`}
                                        centerLabel="Total"
                                    />
                                </div>
                            </div>

                            {/* Bar: Tendencia */}
                            <div className={`${styles.chartCard} ${styles.wideChart}`}>
                                <div className={styles.chartHeader}>
                                    <TrendingUp size={18} />
                                    <h3>Tendencia de Gastos (Diaria)</h3>
                                </div>
                                <div className={styles.chartContent}>
                                    <BarChart
                                        data={dailyTrendData.slice(0, 15)} // Show max 15 bars to fit
                                        maxBars={15}
                                        showValues
                                    />
                                </div>
                            </div>

                            {/* Comparative (Only if 'thisMonth' roughly) */}
                            <div className={`${styles.chartCard} ${styles.wideChart}`}>
                                <div className={styles.chartHeader}>
                                    <Calendar size={18} />
                                    <h3>Comparativa con Mes Anterior</h3>
                                </div>
                                <div className={styles.chartContent}>
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <ComparativeChart data={comparativeExpenses} />
                                    </Suspense>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <AlertCircle size={48} className={styles.emptyIcon} />
                            <h3>No hay datos para este periodo</h3>
                            <p>Intenta ajustar los filtros o el rango de fechas.</p>
                        </div>
                    )}
                </div>
            </LoadingStateWrapper>
        </div>
    );
};
