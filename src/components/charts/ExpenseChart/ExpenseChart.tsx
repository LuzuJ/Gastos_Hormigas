import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './ExpenseChart.module.css';

interface ChartData {
  name: string;
  value: number;
}

interface ExpenseChartProps {
  data: ChartData[];
}

// Colores para las secciones del gráfico. Puedes añadir más.
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.title}>Distribución de Gastos del Mes</h3>
        <p className={styles.emptyMessage}>No hay datos de gastos este mes para mostrar en el gráfico.</p>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.title}>Distribución de Gastos del Mes</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`}
            labelFormatter={() => ''}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};