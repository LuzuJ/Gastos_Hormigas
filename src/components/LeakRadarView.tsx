import React from 'react';
import { JournalEntry, Category, Account } from '../core/models/ledger';
import { AntExpenseAnalytics } from '../core/engine/antExpenseAnalytics';
import { Flame, AlertTriangle, TrendingUp, PieChart, ShieldAlert, Award } from 'lucide-react';

interface LeakRadarViewProps {
  entries: JournalEntry[];
  categories: Category[];
  accounts: Account[];
  monthlyIncome: number;
}

export const LeakRadarView: React.FC<LeakRadarViewProps> = ({
  entries,
  categories,
  accounts,
  monthlyIncome,
}) => {
  const leaks = AntExpenseAnalytics.analyzeLeaks(entries, categories, 30);
  const totalLeaked = leaks.reduce((sum, item) => sum + item.totalSpent, 0);
  const percentOfIncome = monthlyIncome > 0 ? (totalLeaked / monthlyIncome) * 100 : 0;
  const projectedAnnualLeak = totalLeaked * 12;

  const antEntries = entries.filter(e => e.isAntExpense);

  return (
    <div className="animate-pop-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Top Leak Diagnostic Card */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(244, 63, 94, 0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(244, 63, 94, 0.2)',
              color: '#f43f5e',
              padding: '8px',
              borderRadius: '12px'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Radar de Micro-Fugas
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Análisis de fugas silenciosas (Últimos 30 días)
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#f43f5e'
          }}>
            {percentOfIncome.toFixed(1)}% de tus ingresos
          </div>
        </div>

        {/* Big Leak Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Total Fuga Mensual</span>
            <div className="font-mono-num" style={{ fontSize: '24px', fontWeight: 900, color: '#f43f5e', marginTop: '2px' }}>
              ${totalLeaked.toFixed(2)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{antEntries.length} micro-gastos</span>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Proyección Anual</span>
            <div className="font-mono-num" style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
              ${projectedAnnualLeak.toFixed(0)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Ahorro potencial / año</span>
          </div>
        </div>

        {/* Insight Callout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '10px 14px',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#fde68a'
        }}>
          <ShieldAlert size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span>
            {totalLeaked > 0
              ? `Si recortas el 40% de estos micro-gastos, acumularás $${(projectedAnnualLeak * 0.4).toFixed(0)} extras para tu fondo de emergencia este año.`
              : 'Aún no registras micro-gastos. Mantén tu registro diario para detectar fugas.'}
          </span>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart size={16} color="#38bdf8" /> Fugas por Categoría
        </h4>

        {leaks.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
            No hay fugas registradas en los últimos 30 días.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {leaks.map(item => {
              const share = totalLeaked > 0 ? (item.totalSpent / totalLeaked) * 100 : 0;
              const cat = categories.find(c => c.id === item.categoryId);

              return (
                <div key={item.categoryId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{cat?.icon || '📦'}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        {item.categoryName}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>({item.count} compras)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span className="font-mono-num" style={{ fontSize: '14px', fontWeight: 800, color: '#f43f5e' }}>
                        ${item.totalSpent.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>({share.toFixed(0)}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${share}%`,
                      height: '100%',
                      background: cat?.color || '#f43f5e',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
