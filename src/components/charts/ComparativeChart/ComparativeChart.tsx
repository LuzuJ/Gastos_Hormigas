import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import styles from './ComparativeChart.module.css';
import { useTheme } from '../../../hooks/useTheme';

interface ChartData {
  name: string;
  actual: number;
  anterior: number;
  variation?: number;
  percentage?: number;
}

interface ComparativeChartProps {
  data: ChartData[];
}

type ChartType = 'bar' | 'line';
type ComparisonType = 'month' | 'quarter' | 'year';

export const ComparativeChart: React.FC<ComparativeChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('month');
  const [showVariation, setShowVariation] = useState(false);
  
  const tooltipCursorColor = isDark ? '#374151' : '#f3f4f6';

  // Cálculos mejorados de variación
  const enhancedData = useMemo(() => {
    return data.map(item => {
      const variation = item.actual - item.anterior;
      const percentage = item.anterior > 0 ? ((variation / item.anterior) * 100) : 0;
      
      return {
        ...item,
        variation,
        percentage
      };
    });
  }, [data]);

  // Estadísticas generales
  const totalStats = useMemo(() => {
    const totalActual = enhancedData.reduce((sum, item) => sum + item.actual, 0);
    const totalAnterior = enhancedData.reduce((sum, item) => sum + item.anterior, 0);
    const totalVariation = totalActual - totalAnterior;
    const totalPercentage = totalAnterior > 0 ? ((totalVariation / totalAnterior) * 100) : 0;
    
    return {
      totalActual,
      totalAnterior,
      totalVariation,
      totalPercentage
    };
  }, [enhancedData]);

  const getComparisonLabel = () => {
    switch (comparisonType) {
      case 'month': return 'Mes Actual vs. Mes Anterior';
      case 'quarter': return 'Trimestre Actual vs. Trimestre Anterior';
      case 'year': return 'Año Actual vs. Año Anterior';
      default: return 'Comparativa';
    }
  };

  const getPeriodLabels = () => {
    switch (comparisonType) {
      case 'month': return { current: 'Mes Actual', previous: 'Mes Anterior' };
      case 'quarter': return { current: 'Trimestre Actual', previous: 'Trimestre Anterior' };
      case 'year': return { current: 'Año Actual', previous: 'Año Anterior' };
      default: return { current: 'Actual', previous: 'Anterior' };
    }
  };

  const periodLabels = getPeriodLabels();

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart data={enhancedData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? "#cbd5e1" : "#6b7280"} 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke={isDark ? "#cbd5e1" : "#6b7280"} 
            fontSize={12} 
            tickFormatter={(value) => `$${value}`} 
          />
          <Tooltip
            cursor={{ stroke: tooltipCursorColor, strokeWidth: 2 }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
            labelStyle={{ color: isDark ? '#f1f5f9' : '#1f2937' }}
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Line 
            dataKey="anterior" 
            name={periodLabels.previous}
            stroke="#a5b4fc" 
            strokeWidth={3}
            dot={{ fill: '#a5b4fc', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#a5b4fc' }}
          />
          <Line 
            dataKey="actual" 
            name={periodLabels.current}
            stroke="#4f46e5" 
            strokeWidth={3}
            dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#4f46e5' }}
          />
        </LineChart>
      );
    }

    return (
      <BarChart 
        data={enhancedData} 
        layout="vertical" 
        margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
        <XAxis 
          type="number" 
          stroke={isDark ? "#cbd5e1" : "#6b7280"} 
          fontSize={12} 
          tickFormatter={(value) => `$${value}`} 
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke={isDark ? "#cbd5e1" : "#6b7280"} 
          fontSize={12} 
          width={120} 
        />
        <Tooltip
          cursor={{ fill: tooltipCursorColor }}
          formatter={(value: number, name: string) => {
            const item = enhancedData.find(d => d.actual === value || d.anterior === value);
            if (showVariation && item) {
              const variation = item.variation || 0;
              const percentage = item.percentage || 0;
              const sign = variation >= 0 ? '+' : '';
              return [
                `$${value.toFixed(2)}`,
                `${name} (${sign}${variation.toFixed(2)} | ${sign}${percentage.toFixed(1)}%)`
              ];
            }
            return [`$${value.toFixed(2)}`, name];
          }}
          labelStyle={{ color: isDark ? '#f1f5f9' : '#1f2937' }}
          contentStyle={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Bar dataKey="anterior" name={periodLabels.previous} fill="#a5b4fc" radius={[0, 4, 4, 0]} />
        <Bar dataKey="actual" name={periodLabels.current} fill="#4f46e5" radius={[0, 4, 4, 0]} />
      </BarChart>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header con controles */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{getComparisonLabel()}</h3>
          <div className={styles.totalStats}>
            <span className={styles.statItem}>
              Total: <strong>${totalStats.totalActual.toLocaleString()}</strong>
            </span>
            <span className={`${styles.statItem} ${totalStats.totalVariation >= 0 ? styles.positive : styles.negative}`}>
              {totalStats.totalVariation >= 0 ? '+' : ''}${totalStats.totalVariation.toLocaleString()} 
              ({totalStats.totalVariation >= 0 ? '+' : ''}{totalStats.totalPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
        
        <div className={styles.controls}>
          {/* Selector de tipo de gráfico */}
          <div className={styles.controlGroup}>
            <div className={styles.controlLabel}>Tipo:</div>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.controlButton} ${chartType === 'bar' ? styles.active : ''}`}
                onClick={() => setChartType('bar')}
                aria-label="Gráfico de barras"
              >
                📊 Barras
              </button>
              <button
                className={`${styles.controlButton} ${chartType === 'line' ? styles.active : ''}`}
                onClick={() => setChartType('line')}
                aria-label="Gráfico de líneas"
              >
                📈 Líneas
              </button>
            </div>
          </div>

          {/* Selector de comparación */}
          <div className={styles.controlGroup}>
            <label htmlFor="comparison-type" className={styles.controlLabel}>Período:</label>
            <select
              id="comparison-type"
              className={styles.select}
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value as ComparisonType)}
            >
              <option value="month">Mensual</option>
              <option value="quarter">Trimestral</option>
              <option value="year">Anual</option>
            </select>
          </div>

          {/* Toggle para mostrar variación */}
          <div className={styles.controlGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showVariation}
                onChange={(e) => setShowVariation(e.target.checked)}
                className={styles.checkbox}
              />
              {' '}Mostrar variación
            </label>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Insights de variación */}
      {showVariation && (
        <div className={styles.insights}>
          <h4 className={styles.insightsTitle}>💡 Análisis de Variaciones</h4>
          <div className={styles.variationList}>
            {(() => {
              const significantVariations = enhancedData
                .filter(item => Math.abs(item.percentage || 0) > 5)
                .sort((a, b) => Math.abs(b.percentage || 0) - Math.abs(a.percentage || 0))
                .slice(0, 3);

              if (significantVariations.length === 0) {
                // Verificar si es porque no hay datos anteriores
                const hasNoPreviousData = enhancedData.every(item => item.anterior === 0);
                
                return (
                  <div className={styles.emptyVariations}>
                    {hasNoPreviousData ? (
                      <>
                        <p className={styles.emptyMessage}>
                          📊 Para ver el análisis de variaciones necesitas datos del período anterior.
                        </p>
                        <p className={styles.emptyHint}>
                          💡 Registra gastos por al menos 2 períodos para comparar tendencias y detectar cambios en tus patrones de gasto.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className={styles.emptyMessage}>
                          📈 No hay variaciones significativas en este período.
                        </p>
                        <p className={styles.emptyHint}>
                          💡 Tus gastos se mantienen estables comparado con el período anterior (variaciones menores al 5%).
                        </p>
                      </>
                    )}
                  </div>
                );
              }

              return significantVariations.map(item => (
                <div key={item.name} className={styles.variationItem}>
                  <span className={styles.categoryName}>{item.name}:</span>
                  <span className={`${styles.variationValue} ${(item.percentage || 0) >= 0 ? styles.positive : styles.negative}`}>
                    {(item.percentage || 0) >= 0 ? '+' : ''}{item.percentage?.toFixed(1)}%
                    ({(item.variation || 0) >= 0 ? '+' : ''}${item.variation?.toFixed(2)})
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};