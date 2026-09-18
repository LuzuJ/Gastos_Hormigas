import React from 'react';
import { LocalState } from '../../core/sync/localStore';
import { SafeToSpendMetrics } from '../../core/models/ledger';
import { DailyWisdom } from './DailyWisdom';
import { SmartInsight } from './SmartInsight';
import { SafeToSpendGauge } from '../SafeToSpendGauge';
import { AntExpenseFeed } from '../AntExpenseFeed';
import { ArrowDownLeft, ArrowUpRight, Zap, Flame, Wallet, Sparkles } from 'lucide-react';

interface DashboardOverviewProps {
  state: LocalState;
  metrics: SafeToSpendMetrics;
  onOpenIncomeModal: () => void;
  onNavigateToCapture: () => void;
  onDeleteEntry: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  state,
  metrics,
  onOpenIncomeModal,
  onNavigateToCapture,
  onDeleteEntry,
}) => {
  return (
    <div className="animate-pop-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* 1. Daily Wisdom (Sabiduría del Día) */}
      <DailyWisdom />

      {/* 2. Smart Insight (AI Coach & Velocity) */}
      <SmartInsight metrics={metrics} entries={state.entries} />

      {/* 3. Safe to Spend Hero Radial Gauge */}
      <SafeToSpendGauge metrics={metrics} onOpenBudgetModal={onOpenIncomeModal} />

      {/* 4. Quick Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div
          onClick={onOpenIncomeModal}
          className="glass-card tactile-btn"
          style={{
            padding: '16px 18px',
            cursor: 'pointer',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.75) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <ArrowDownLeft size={16} /> Ingresos Mes
          </div>
          <div className="font-mono-num" style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
            ${metrics.totalMonthlyIncome.toFixed(0)}
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '16px 18px',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.75) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <ArrowUpRight size={16} /> Gastos Totales
          </div>
          <div className="font-mono-num" style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
            ${metrics.spentSoFarThisMonth.toFixed(0)}
          </div>
        </div>
      </div>

      {/* 5. Quick Fast Capture Banner */}
      <div
        onClick={onNavigateToCapture}
        className="glass-card tactile-btn"
        style={{
          padding: '18px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 12px 24px -6px rgba(14, 165, 233, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            padding: '10px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '-0.2px' }}>¿Tuviste un gasto recién?</div>
            <div style={{ fontSize: '13px', opacity: 0.95, marginTop: '2px' }}>Regístralo en 1 segundo con el teclado rápido</div>
          </div>
        </div>
        <span style={{ fontSize: '22px' }}>⚡</span>
      </div>

      {/* 6. Recent Feed Activity */}
      <AntExpenseFeed
        entries={state.entries}
        categories={state.categories}
        accounts={state.accounts}
        onDeleteEntry={onDeleteEntry}
      />
    </div>
  );
};
