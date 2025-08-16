import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './ComparativeChart.module.css';
import { useTheme } from '../../hooks/useTheme';

interface ChartData {
  name: string;
  actual: number;
  anterior: number;
}

interface ComparativeChartProps {
  data: ChartData[];
}

export const ComparativeChart: React.FC<ComparativeChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const tooltipCursorColor = isDark ? '#374151' : '#f3f4f6';

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Comparativa Mes Actual vs. Mes Anterior</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
          <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} width={100} />
          <Tooltip
            cursor={{ fill: tooltipCursorColor }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
          <Legend />
          <Bar dataKey="anterior" name="Mes Anterior" fill="#a5b4fc" />
          <Bar dataKey="actual" name="Mes Actual" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};