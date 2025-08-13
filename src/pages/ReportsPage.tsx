import React from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import styles from './ReportsPage.module.css'; // Asegúrate de que el nombre del import coincida
import { MonthlyTrendChart } from '../components/MonthlyTrendChart/MonthlyTrendChart';
import { ExpenseChart } from '../components/ExpenseChart/ExpenseChart';
import { ComparativeChart } from '../components/ComparativeChart/ComparativeChart';

export const ReportsPage: React.FC<{ userId: string | null, isGuest?: boolean }> = ({ userId }) => {
    const { 
      monthlyExpensesTrend, 
      monthlyExpensesByCategory,
      comparativeExpenses 
    } = useExpensesController(userId);

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