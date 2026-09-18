import React from 'react';
import { JournalEntry, Category } from '../../core/models/ledger';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, Flame } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface StatsChartViewProps {
  entries: JournalEntry[];
  categories: Category[];
}

export const StatsChartView: React.FC<StatsChartViewProps> = ({ entries, categories }) => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const currentMonthExpenses = entries.filter(e => {
    const d = new Date(e.timestamp);
    return e.entryType === 'expense' && d >= monthStart && d <= monthEnd;
  });

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // 1. Data for Category Pie Chart
  const categoryTotals = new Map<string, number>();
  for (const exp of currentMonthExpenses) {
    const catId = exp.categoryId || 'other';
    categoryTotals.set(catId, (categoryTotals.get(catId) || 0) + exp.amount);
  }

  const pieData = Array.from(categoryTotals.entries()).map(([catId, amount]) => {
    const cat = categoryMap.get(catId);
    return {
      name: cat?.name || 'Varios',
      value: Math.round(amount * 100) / 100,
      color: cat?.color || '#94a3b8',
      icon: cat?.icon || '📦'
    };
  }).filter(d => d.value > 0);

  // 2. Data for Normal vs Ant Expenses
  let antTotal = 0;
  let regularTotal = 0;
  for (const exp of currentMonthExpenses) {
    if (exp.isAntExpense) antTotal += exp.amount;
    else regularTotal += exp.amount;
  }

  const comparisonData = [
    { name: 'Gastos Base', monto: Math.round(regularTotal) },
    { name: 'Fugas Hormiga', monto: Math.round(antTotal) }
  ];

  return (
    <div className="animate-pop-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Category Pie Distribution */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieIcon size={18} color="#38bdf8" /> Distribución de Gastos del Mes
        </h4>

        {pieData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
            No hay gastos registrados en el mes actual.
          </div>
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Gasto']}
                  contentStyle={{
                    background: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontWeight: 700
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Custom Legend Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {pieData.map(item => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
              <span>{item.icon} {item.name}: <b>${item.value}</b></span>
            </div>
          ))}
        </div>
      </div>

      {/* Ant vs Regular Comparison Bar */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="#f43f5e" /> Fugas Hormiga vs Gasto Planificado
        </h4>

        <div style={{ width: '100%', height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(value: any) => [`$${value}`, 'Total']}
                contentStyle={{
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontWeight: 700
                }}
              />
              <Bar dataKey="monto" radius={[8, 8, 0, 0]} fill="#38bdf8">
                {comparisonData.map((entry, idx) => (
                  <Cell key={`bar-${idx}`} fill={idx === 1 ? '#f43f5e' : '#38bdf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
