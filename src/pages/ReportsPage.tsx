import React, { useState } from 'react';
import { useExpensesContext, useCategoriesContext } from '../contexts/AppContext';
import { ReportsFilter, type ReportsFilterState } from '../components/features/reports/ReportsFilter/ReportsFilter';
import { useReportsFilter } from '../hooks/financials/useReportsFilter';
import GastosHormigaAnalysis from '../components/features/expenses/GastosHormigaAnalysis/GastosHormigaAnalysis';
import styles from './ReportsPage.module.css';
import { GuestBlockedFeature } from '../components/misc/GuestBlockedFeature/GuestBlockedFeature';

export const ReportsPage: React.FC<{ isGuest: boolean }> = ({ isGuest }) => {
    const [filterState, setFilterState] = useState<ReportsFilterState>({
        period: 'thisMonth',
        dateRange: { startDate: null, endDate: null },
        selectedCategoryId: 'all'
    });

    const { expenses } = useExpensesContext();
    const { categories } = useCategoriesContext();

    const { filteredExpenses, totalAmount, categoryCount, dateRangeLabel } = useReportsFilter({
        expenses,
        categories,
        filterPeriod: filterState.period,
        dateRange: filterState.dateRange,
        selectedCategoryId: filterState.selectedCategoryId
    });

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
            <div>
                <h2 className="section-title">Reportes</h2>
                <GuestBlockedFeature message="Guarda tu historial de gastos y accede a reportes detallados creando una cuenta gratuita." />
            </div>
        );
    }

    return (
        <div>
            <h2 className="section-title">Reportes</h2>
            <p className="section-subtitle">Filtra y analiza tus gastos hormiga</p>

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
                    <div className={styles.statLabel}>Categorías</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{dateRangeLabel}</div>
                    <div className={styles.statLabel}>Período</div>
                </div>
            </div>

            {/* Análisis de Gastos Hormiga */}
            <GastosHormigaAnalysis
                expenses={filteredExpenses}
                categories={categories}
                threshold={20}
            />
        </div>
    );
};
