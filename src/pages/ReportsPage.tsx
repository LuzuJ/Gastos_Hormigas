import React from 'react';
// 1. Importamos el hook de contexto en lugar del controlador.
import { useCombinedCalculationsContext } from '../contexts/AppContext';
import styles from './ReportsPage.module.css';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart/MonthlyTrendChart';
import { ExpenseChart } from '../components/ExpenseChart/ExpenseChart';
import { ComparativeChart } from '../components/ComparativeChart/ComparativeChart';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature';

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
              {/* Los componentes de gráficos ahora reciben los datos del contexto. */}
              <ComparativeChart data={comparativeExpenses} />
              <MonthlyTrendChart data={monthlyExpensesTrend} />
              <ExpenseChart data={monthlyExpensesByCategory} />
            </div>
        </div>
    );
};
