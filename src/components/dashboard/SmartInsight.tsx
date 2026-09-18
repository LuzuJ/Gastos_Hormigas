import React from 'react';
import { JournalEntry, SafeToSpendMetrics } from '../../core/models/ledger';
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Flame, Lightbulb } from 'lucide-react';

interface SmartInsightProps {
  metrics: SafeToSpendMetrics;
  entries: JournalEntry[];
}

export const SmartInsight: React.FC<SmartInsightProps> = ({ metrics, entries }) => {
  const { burnRatePercentage, dailySafeToSpend, remainingPoolThisMonth, daysRemainingInMonth, antExpensesTotalMonth } = metrics;

  let type: 'success' | 'warning' | 'danger' | 'info' = 'info';
  let title = 'Diagnóstico Financiero Inteligente';
  let message = '';
  let tip = '';

  if (metrics.totalMonthlyIncome <= 0) {
    type = 'info';
    title = 'Configura tus Ingresos';
    message = 'Para desbloquear el cálculo predictivo y tus límites diarios, configura tu ingreso mensual estimado.';
    tip = 'Haz clic en el botón superior derecho para ingresar tu monto.';
  } else if (burnRatePercentage >= 90) {
    type = 'danger';
    title = '¡Alerta de Consumo Crítico!';
    message = `Has consumido el ${burnRatePercentage}% de tu presupuesto disponible y aún restan ${daysRemainingInMonth} días del mes.`;
    tip = 'Recomendación: Congela temporalmente salidas no esenciales y limita tus micro-gastos.';
  } else if (burnRatePercentage >= 75) {
    type = 'warning';
    title = 'Ritmo Acelerado de Gasto';
    message = `Tu disponible diario es de $${dailySafeToSpend.toFixed(2)}. Si mantienes el ritmo actual, agotarás el presupuesto antes de fin de mes.`;
    tip = 'Recomendación: Monitorea tus compras de $1-$5 que acumulan fugas silenciosas.';
  } else if (burnRatePercentage > 0 && burnRatePercentage < 50 && daysRemainingInMonth < 15) {
    type = 'success';
    title = '¡Excelente Disciplina de Ahorro!';
    message = `Mantienes un control impecable. Proyectas cerrar el mes con un excedente de $${remainingPoolThisMonth.toFixed(0)} para tus metas.`;
    tip = 'Recomendación: Transfiere parte del excedente a tu Bóveda de Ahorro para no gastarlo por impulso.';
  } else {
    type = 'info';
    title = 'Ritmo Estable & Bajo Control';
    message = `Tienes $${dailySafeToSpend.toFixed(2)} seguros por día. Las fugas hormiga representan $${antExpensesTotalMonth.toFixed(0)} este mes.`;
    tip = 'Cada micro-gasto evitado aumenta tu margen diario para los próximos días.';
  }

  const borderColors = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#38bdf8'
  };

  const bgGradients = {
    success: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
    warning: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
    danger: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
    info: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)'
  };

  const icons = {
    success: <CheckCircle2 size={20} color="#10b981" />,
    warning: <TrendingUp size={20} color="#f59e0b" />,
    danger: <AlertTriangle size={20} color="#f43f5e" />,
    info: <Sparkles size={20} color="#38bdf8" />
  };

  return (
    <div className="glass-card animate-pop-in" style={{
      padding: '18px 20px',
      marginBottom: '18px',
      background: bgGradients[type],
      border: `1px solid ${borderColors[type]}33`,
      borderLeft: `4px solid ${borderColors[type]}`
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {icons[type]}
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '15px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.2px'
          }}>
            {title}
          </h4>
          <p style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            color: '#e2e8f0',
            lineHeight: '1.45'
          }}>
            {message}
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '5px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <Lightbulb size={13} color={borderColors[type]} />
            <span>{tip}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
