import React from 'react';
import { SafeToSpendMetrics } from '../core/models/ledger';
import { ShieldCheck, AlertOctagon, Flame, Calendar, Sparkles, TrendingDown } from 'lucide-react';

interface SafeToSpendGaugeProps {
  metrics: SafeToSpendMetrics;
  onOpenBudgetModal?: () => void;
}

export const SafeToSpendGauge: React.FC<SafeToSpendGaugeProps> = ({ metrics, onOpenBudgetModal }) => {
  const isHealthy = metrics.burnRatePercentage < 75;
  const isWarning = metrics.burnRatePercentage >= 75 && metrics.burnRatePercentage < 90;
  const isCritical = metrics.burnRatePercentage >= 90;

  const statusColor = isCritical ? '#f43f5e' : (isWarning ? '#f59e0b' : '#38bdf8');
  const statusBg = isCritical ? 'rgba(244, 63, 94, 0.15)' : (isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)');

  // SVG circular gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(100, Math.max(0, metrics.burnRatePercentage));
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="glass-card animate-pop-in" style={{
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '520px',
      margin: '0 auto 20px auto',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: `radial-gradient(circle, ${statusColor}33 0%, transparent 70%)`,
        pointerEvents: 'none',
        filter: 'blur(30px)',
      }} />

      {/* Main Metric & Gauge Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* Left: Big Safe-to-Spend Number */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 800,
              color: '#cbd5e1'
            }}>
              Disponible Hoy
            </span>
            <div style={{
              background: statusBg,
              color: statusColor,
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {isCritical ? <AlertOctagon size={13} /> : <ShieldCheck size={13} />}
              {isCritical ? 'Al Límite' : (isWarning ? 'Precaución' : 'Seguro')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: statusColor }}>$</span>
            <span className="font-mono-num" style={{
              fontSize: '48px',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              textShadow: `0 0 30px ${statusColor}44`
            }}>
              {metrics.dailySafeToSpend.toFixed(2)}
            </span>
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 700, marginLeft: '4px' }}>/día</span>
          </div>

          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '6px 0 0 0', lineHeight: 1.4 }}>
            Puedes gastar esto hoy sin arriesgar tus pagos fijos ni tu meta de ahorro.
          </p>
        </div>

        {/* Right: Modern Circular Meter */}
        <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
          <svg width="96" height="96" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke={statusColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <span className="font-mono-num" style={{ fontSize: '20px', fontWeight: 900, color: '#f8fafc' }}>
              {Math.round(metrics.burnRatePercentage)}%
            </span>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>
              Consumo
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginTop: '18px',
        padding: '12px 14px',
        background: 'rgba(10, 15, 26, 0.75)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {/* Metric 1: Restante Mes */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>
            Restante Mes
          </span>
          <div className="font-mono-num" style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginTop: '3px' }}>
            ${metrics.remainingPoolThisMonth.toFixed(0)}
          </div>
        </div>

        {/* Metric 2: Fugas Hormiga */}
        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#f43f5e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', letterSpacing: '0.5px' }}>
            <Flame size={12} /> Fugas Mes
          </span>
          <div className="font-mono-num" style={{ fontSize: '16px', fontWeight: 800, color: '#f43f5e', marginTop: '3px' }}>
            ${metrics.antExpensesTotalMonth.toFixed(0)}
          </div>
        </div>

        {/* Metric 3: Días Restantes */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', letterSpacing: '0.5px' }}>
            <Calendar size={12} /> Días
          </span>
          <div className="font-mono-num" style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
            {metrics.daysRemainingInMonth}d
          </div>
        </div>
      </div>
    </div>
  );
};
