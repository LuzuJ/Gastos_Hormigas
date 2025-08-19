import React, { Suspense, lazy } from 'react';
// 1. Importamos el hook de contexto en lugar del controlador.
import { useCombinedCalculationsContext } from '../contexts/AppContext';
import { LoadingSpinner } from '../components/LoadingState/LoadingState';
import styles from './ReportsPage.module.css';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';

// Lazy loading para componentes de gráficos pesados
const MonthlyTrendChart = lazy(() => import('../components/MonthlyTrendChart/MonthlyTrendChart').then(module => ({ default: module.MonthlyTrendChart })));
const ExpenseChart = lazy(() => import('../components/ExpenseChart/ExpenseChart').then(module => ({ default: module.ExpenseChart })));
const ComparativeChart = lazy(() => import('../components/ComparativeChart/ComparativeChart').then(module => ({ default: module.ComparativeChart })));

// 2. El 'userId' ya no es necesario como prop, el AppProvider se encarga de él.
export const ReportsPage: React.FC<{ isGuest: boolean }> = ({ isGuest }) => {
    // 3. Consumimos los datos directamente del contexto de cálculos combinados.
    const { 
      monthlyExpensesTrend, 
      monthlyExpensesByCategory,
      comparativeExpenses 
    } = useCombinedCalculationsContext();

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

            <div className={styles.grid}>
              {/* Los componentes de gráficos ahora reciben los datos del contexto con lazy loading. */}
              <Suspense fallback={<LoadingSpinner message="Cargando gráfico comparativo..." />}>
                <ComparativeChart data={comparativeExpenses} />
              </Suspense>
              
              <Suspense fallback={<LoadingSpinner message="Cargando tendencias mensuales..." />}>
                <MonthlyTrendChart data={monthlyExpensesTrend} />
              </Suspense>
              
              <Suspense fallback={<LoadingSpinner message="Cargando gráfico de gastos..." />}>
                <ExpenseChart data={monthlyExpensesByCategory} />
              </Suspense>
            </div>
        </div>
    );
};
