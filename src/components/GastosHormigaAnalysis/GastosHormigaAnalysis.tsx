import { useMemo } from 'react';
import { Card } from '../common/Card/Card';
import { ProgressBar } from '../common/ProgressBar/ProgressBar';
import styles from './GastosHormigaAnalysis.module.css';
import type { Expense, Category } from '../../types';

interface GastosHormigaAnalysisProps {
  expenses: Expense[];
  categories: Category[];
  threshold?: number; // Umbral para considerar un gasto como "hormiga"
  className?: string;
}

interface GastoHormigaData {
  totalAmount: number;
  totalCount: number;
  yearlyProjection: number;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  averageAmount: number;
  percentageOfTotal: number;
}

export const GastosHormigaAnalysis = ({ 
  expenses, 
  categories, 
  threshold = 5,
  className 
}: GastosHormigaAnalysisProps) => {
  
  const gastosHormigaData = useMemo((): GastoHormigaData => {
    // Filtrar gastos del mes actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      if (!expense.createdAt) return false;
      const expenseDate = expense.createdAt.toDate();
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    // Filtrar gastos hormiga (por debajo del umbral)
    const gastosHormiga = monthlyExpenses.filter(expense => expense.amount <= threshold);
    
    // Calcular totales
    const totalAmount = gastosHormiga.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCount = gastosHormiga.length;
    const yearlyProjection = totalAmount * 12;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // Calcular porcentaje del total de gastos
    const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentageOfTotal = totalMonthlyExpenses > 0 ? (totalAmount / totalMonthlyExpenses) * 100 : 0;
    
    // Agrupar por categoría
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    gastosHormiga.forEach(expense => {
      const existing = categoryMap.get(expense.categoryId) || { amount: 0, count: 0 };
      categoryMap.set(expense.categoryId, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1
      });
    });
    
    // Crear array de categorías principales y calcular porcentajes
    const topCategories = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: category?.name || 'Categoría desconocida',
          amount: data.amount,
          count: data.count,
          percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3); // Top 3 categorías
    
    return {
      totalAmount,
      totalCount,
      yearlyProjection,
      topCategories,
      averageAmount,
      percentageOfTotal
    };
  }, [expenses, categories, threshold]);

  const getImpactLevel = (percentage: number): { level: 'low' | 'medium' | 'high'; label: string; color: string } => {
    if (percentage < 10) return { level: 'low', label: 'Bajo impacto', color: '#10b981' };
    if (percentage < 25) return { level: 'medium', label: 'Impacto moderado', color: '#f59e0b' };
    return { level: 'high', label: 'Alto impacto', color: '#ef4444' };
  };

  const impactInfo = getImpactLevel(gastosHormigaData.percentageOfTotal);

  if (gastosHormigaData.totalCount === 0) {
    return (
      <Card className={`${styles.container} ${className || ''}`}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>🐜 Análisis de Gastos Hormiga</h3>
            <p className={styles.subtitle}>Gastos menores a ${threshold}</p>
          </div>
        </div>
        
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎉</div>
          <h4>¡Excelente control!</h4>
          <p>No tienes gastos hormiga este mes. Continúa con tus buenos hábitos financieros.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>🐜 Análisis de Gastos Hormiga</h3>
          <p className={styles.subtitle}>Gastos menores a ${threshold} • {gastosHormigaData.totalCount} transacciones</p>
        </div>
        <div className={styles.impactBadge} style={{ backgroundColor: impactInfo.color }}>
          {impactInfo.label}
        </div>
      </div>

      <div className={styles.content}>
        {/* Estadísticas principales */}
        <div className={styles.mainStats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>${gastosHormigaData.totalAmount.toFixed(2)}</div>
            <div className={styles.statLabel}>Este mes</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>${gastosHormigaData.yearlyProjection.toFixed(0)}</div>
            <div className={styles.statLabel}>Proyección anual</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{gastosHormigaData.percentageOfTotal.toFixed(1)}%</div>
            <div className={styles.statLabel}>Del total de gastos</div>
          </div>
        </div>

        {/* Mensaje de impacto */}
        <div className={styles.impactMessage}>
          <p>
            Has gastado <strong>${gastosHormigaData.totalAmount.toFixed(2)}</strong> en pequeños gastos este mes. 
            Al ritmo actual, esto equivale a <strong>${gastosHormigaData.yearlyProjection.toFixed(0)} al año</strong>. 
            {gastosHormigaData.yearlyProjection > 600 && (
              <span className={styles.warning}> ¡Eso es suficiente para un fondo de emergencia!</span>
            )}
          </p>
        </div>

        {/* Top categorías */}
        {gastosHormigaData.topCategories.length > 0 && (
          <div className={styles.topCategories}>
            <h4 className={styles.sectionTitle}>Principales categorías de gastos hormiga</h4>
            <div className={styles.categoriesList}>
              {gastosHormigaData.topCategories.map((category, index) => (
                <div key={category.categoryId} className={styles.categoryItem}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryRank}>#{index + 1}</span>
                    <span className={styles.categoryName}>{category.categoryName}</span>
                    <span className={styles.categoryAmount}>${category.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className={styles.categoryDetails}>
                    <span className={styles.categoryCount}>{category.count} gastos</span>
                    <ProgressBar
                      value={category.percentage}
                      max={100}
                      size="small"
                      variant="primary"
                      showLabel={false}
                      className={styles.categoryProgress}
                    />
                    <span className={styles.categoryPercentage}>{category.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consejos */}
        <div className={styles.tips}>
          <h4 className={styles.sectionTitle}>💡 Consejos para reducir gastos hormiga</h4>
          <ul className={styles.tipsList}>
            <li>Revisa tus compras impulsivas, especialmente en la categoría principal</li>
            <li>Establece un presupuesto semanal para gastos pequeños</li>
            <li>Considera el costo anual antes de hacer compras recurrentes</li>
            <li>Lleva registro de estos pequeños gastos para mayor conciencia</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default GastosHormigaAnalysis;
