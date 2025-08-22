import React, { Suspense, lazy, useState, useMemo } from 'react';
// 1. Importamos el hook de contexto en lugar del controlador.
import { useCombinedCalculationsContext, useExpensesContext, useCategoriesContext } from '../contexts/AppContext';
import { LoadingSpinner } from '../components/LoadingState/LoadingState';
import { ReportsFilter, type ReportsFilterState } from '../components/features/reports/ReportsFilter/ReportsFilter';
import { useReportsFilter } from '../hooks/financials/useReportsFilter';
import GastosHormigaAnalysis from '../components/features/expenses/GastosHormigaAnalysis/GastosHormigaAnalysis';
import styles from './ReportsPage.module.css';
import { GuestBlockedFeature } from '../components/misc/GuestBlockedFeature/GuestBlockedFeature';

// Lazy loading para componentes de gráficos pesados
const MonthlyTrendChart = lazy(() => import('../components/charts/MonthlyTrendChart/MonthlyTrendChart').then(module => ({ default: module.MonthlyTrendChart })));
const ExpenseChart = lazy(() => import('../components/charts/ExpenseChart/ExpenseChart').then(module => ({ default: module.ExpenseChart })));
const ComparativeChart = lazy(() => import('../components/charts/ComparativeChart/ComparativeChart').then(module => ({ default: module.ComparativeChart })));

// 2. El 'userId' ya no es necesario como prop, el AppProvider se encarga de él.
export const ReportsPage: React.FC<{ isGuest: boolean }> = ({ isGuest }) => {
    // Estado para los filtros
    const [filterState, setFilterState] = useState<ReportsFilterState>({
        period: 'thisMonth',
        dateRange: { startDate: null, endDate: null },
        selectedCategoryId: 'all'
    });

    // 3. Consumimos los datos directamente del contexto de cálculos combinados.
    const { 
      monthlyExpensesTrend, 
      monthlyExpensesByCategory,
      comparativeExpenses 
    } = useCombinedCalculationsContext();

    // Obtener gastos y categorías para el filtrado
    const { expenses } = useExpensesContext();
    const { categories } = useCategoriesContext();
    
    // Aplicar filtros a los datos
    const { filteredExpenses, totalAmount, categoryCount, dateRangeLabel } = useReportsFilter({
        expenses,
        categories,
        filterPeriod: filterState.period,
        dateRange: filterState.dateRange,
        selectedCategoryId: filterState.selectedCategoryId
    });

    // Procesar datos filtrados para los gráficos
    const filteredChartsData = useMemo(() => {
        // Aquí procesarías los datos filtrados para cada gráfico
        // Por ahora, usamos los datos originales y después se pueden adaptar
        return {
            monthlyTrend: monthlyExpensesTrend,
            categoryDistribution: monthlyExpensesByCategory,
            comparative: comparativeExpenses
        };
    }, [filteredExpenses, monthlyExpensesTrend, monthlyExpensesByCategory, comparativeExpenses]);

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

    // La lógica para usuarios invitados se mantiene igual.
    if (isGuest) {
        return (
            <div>
                <h2 className="section-title">Reportes y Análisis</h2>
                <GuestBlockedFeature message="Guarda tu historial de gastos y accede a reportes detallados creando una cuenta gratuita." />
            </div>
        );
    }

    return (
        <div>
            <h2 className="section-title">Reportes y Análisis</h2>
            <p className="section-subtitle">Analiza tus patrones de gasto para tomar mejores decisiones financieras.</p>

            {/* Filtros Avanzados */}
            <ReportsFilter
                filterState={filterState}
                onFilterChange={handleFilterChange}
                categories={categories}
                onReset={handleFilterReset}
            />

            {/* Estadísticas del Filtro Aplicado */}
            <div className={styles.filterStats}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>${totalAmount.toLocaleString()}</div>
                    <div className={styles.statLabel}>Total gastado</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{filteredExpenses.length}</div>
                    <div className={styles.statLabel}>Gastos registrados</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{categoryCount}</div>
                    <div className={styles.statLabel}>Categorías utilizadas</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{dateRangeLabel}</div>
                    <div className={styles.statLabel}>Período analizado</div>
                </div>
            </div>

            {/* Análisis de Gastos Hormiga */}
            <GastosHormigaAnalysis 
                expenses={filteredExpenses}
                categories={categories}
                threshold={20}
            />

            <div className={styles.grid}>
              {/* Los componentes de gráficos ahora reciben los datos del contexto con lazy loading. */}
              <Suspense fallback={<LoadingSpinner message="Cargando gráfico comparativo..." />}>
                <ComparativeChart data={filteredChartsData.comparative} />
              </Suspense>
              
              <Suspense fallback={<LoadingSpinner message="Cargando tendencias mensuales..." />}>
                <MonthlyTrendChart data={filteredChartsData.monthlyTrend} />
              </Suspense>
              
              <Suspense fallback={<LoadingSpinner message="Cargando gráfico de gastos..." />}>
                <ExpenseChart data={filteredChartsData.categoryDistribution} />
              </Suspense>
            </div>
        </div>
    );
};
