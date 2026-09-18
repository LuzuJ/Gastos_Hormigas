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
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="var(--text-secondary)"
              fontSize={11}
              tickFormatter={(value: number) => `$${value}`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background-card)',
                borderColor: 'var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                color: 'var(--text-primary)'
              }}
              cursor={{ fill: 'var(--background-hover)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
              labelFormatter={(label) => `${label}`}
            />
            <Bar
              dataKey="total"
              fill="var(--primary-accent)"
              radius={[4, 4, 0, 0]} /* Rounded top bars */
              barSize={20} /* Slightly thinner bars */
            />
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