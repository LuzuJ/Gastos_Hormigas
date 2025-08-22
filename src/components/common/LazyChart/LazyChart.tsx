import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '../../layout/ErrorBoundary/ErrorBoundary';

/**
 * Lazy loading para componentes de gráficos pesados
 * Mejora el rendimiento cargando los gráficos solo cuando son necesarios
 */

const ExpenseChart = lazy(() => 
  import('../../charts/ExpenseChart/ExpenseChart').then(module => ({
    default: module.ExpenseChart
  }))
);

const MonthlyTrendChart = lazy(() => 
  import('../../charts/MonthlyTrendChart/MonthlyTrendChart').then(module => ({
    default: module.MonthlyTrendChart
  }))
);

const ComparativeChart = lazy(() => 
  import('../../charts/ComparativeChart/ComparativeChart').then(module => ({
    default: module.ComparativeChart
  }))
);

// Componente wrapper para gráficos lazy
interface LazyChartProps {
  type: 'expense' | 'monthly-trend' | 'comparative';
  fallback?: React.ReactNode;
  data?: any;
  [key: string]: any;
}

export const LazyChart: React.FC<LazyChartProps> = ({ 
  type, 
  fallback,
  ...props 
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-600">Cargando gráfico...</p>
      </div>
    </div>
  );

  const LoadingFallback = fallback || defaultFallback;

  const renderChart = () => {
    switch (type) {
      case 'expense':
        return <ExpenseChart {...props as any} />;
      case 'monthly-trend':
        return <MonthlyTrendChart {...props as any} />;
      case 'comparative':
        return <ComparativeChart {...props as any} />;
      default:
        return <div>Tipo de gráfico no válido</div>;
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={LoadingFallback}>
        {renderChart()}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Hook para precargar gráficos de forma programática
 */
export const usePreloadCharts = () => {
  const preloadChart = React.useCallback((type: 'expense' | 'monthly-trend' | 'comparative') => {
    switch (type) {
      case 'expense':
        import('../../charts/ExpenseChart/ExpenseChart').catch(console.warn);
        break;
      case 'monthly-trend':
        import('../../charts/MonthlyTrendChart/MonthlyTrendChart').catch(console.warn);
        break;
      case 'comparative':
        import('../../charts/ComparativeChart/ComparativeChart').catch(console.warn);
        break;
    }
  }, []);

  const preloadAllCharts = React.useCallback(() => {
    preloadChart('expense');
    preloadChart('monthly-trend');
    preloadChart('comparative');
  }, [preloadChart]);

  return { preloadChart, preloadAllCharts };
};
