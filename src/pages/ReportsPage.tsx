import React from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import styles from './ReportsPage.module.css';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart/MonthlyTrendChart';
import { ExpenseChart } from '../components/ExpenseChart/ExpenseChart';
import { ComparativeChart } from '../components/ComparativeChart/ComparativeChart';
import { GuestBlockedFeature } from '../components/GuestBlockedFeature/GuestBlockedFeature'; // 1. Importar

export const ReportsPage: React.FC<{ userId: string | null, isGuest: boolean }> = ({ userId, isGuest }) => {
    const { 
      monthlyExpensesTrend, 
      monthlyExpensesByCategory,
      comparativeExpenses 
    } = useExpensesController(userId);

    // 2. Condicional para toda la página
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
              <ComparativeChart data={comparativeExpenses} />
              <MonthlyTrendChart data={monthlyExpensesTrend} />
              <ExpenseChart data={monthlyExpensesByCategory} />
            </div>
        </div>
    );
};