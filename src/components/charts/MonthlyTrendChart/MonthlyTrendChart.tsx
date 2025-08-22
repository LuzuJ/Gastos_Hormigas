import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './MonthlyTrendChart.module.css';
import { useTheme } from '../../../hooks/useTheme';

interface ChartData {
  name: string;
  total: number;
}

interface MonthlyTrendChartProps {
  data: ChartData[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const hasData = data.some(item => item.total > 0);
  const { isDark } = useTheme();

  const tooltipCursorColor = isDark ? '#374151' : '#f3f4f6';

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>Tendencia de Gastos Mensuales</h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value: number) => `$${value}`} />
            <Tooltip
              cursor={{ fill: tooltipCursorColor }} 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Gastado']}
              labelFormatter={(label) => `Mes: ${label}`}
            />
            <Bar dataKey="total" fill="#4f46e5" name="Total Gastado" barSize={30}  />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className={styles.emptyState}>
          <p>No hay suficientes datos para mostrar una tendencia.</p>
        </div>
      )}
    </div>
  );
};