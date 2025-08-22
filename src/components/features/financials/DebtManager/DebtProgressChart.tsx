import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../../../../utils/formatters';
import styles from './DebtProgressChart.module.css';

interface DebtProgressPoint {
  month: number;
  totalDebt: number;
  monthLabel: string;
  totalPaid: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  initialDebtAmount: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, initialDebtAmount }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <h4 className={styles.tooltipTitle}>{data.monthLabel}</h4>
        <div className={styles.tooltipContent}>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Deuda restante:</span>
            <span className={styles.tooltipValue}>{formatCurrency(data.totalDebt)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Total pagado:</span>
            <span className={styles.tooltipValue}>{formatCurrency(data.totalPaid)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Progreso:</span>
            <span className={styles.tooltipValue}>
              {((data.totalPaid / (initialDebtAmount || 1)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface DebtProgressChartProps {
  paymentSchedule: Array<{
    month: number;
    totalPaid: number;
    remainingDebt: number;
  }>;
  strategy: 'snowball' | 'avalanche';
  initialDebtAmount: number;
}

export const DebtProgressChart: React.FC<DebtProgressChartProps> = ({ 
  paymentSchedule, 
  strategy,
  initialDebtAmount 
}) => {
  const chartData = useMemo(() => {
    const data: DebtProgressPoint[] = [];
    
    // Punto inicial (mes 0)
    data.push({
      month: 0,
      totalDebt: initialDebtAmount,
      monthLabel: 'Inicio',
      totalPaid: 0
    });

    // Agregar datos del cronograma
    paymentSchedule.forEach((monthData) => {
      const monthLabel = monthData.month <= 12 
        ? `Mes ${monthData.month}` 
        : `Año ${Math.floor((monthData.month - 1) / 12) + 1}, M${((monthData.month - 1) % 12) + 1}`;
      
      data.push({
        month: monthData.month,
        totalDebt: monthData.remainingDebt,
        monthLabel,
        totalPaid: monthData.totalPaid
      });
    });

    return data;
  }, [paymentSchedule, initialDebtAmount]);

  const strategyConfig = {
    snowball: {
      color: '#3B82F6', // Azul
      name: 'Estrategia Bola de Nieve',
      icon: '❄️'
    },
    avalanche: {
      color: '#DC2626', // Rojo
      name: 'Estrategia Avalancha',
      icon: '🏔️'
    }
  };

  const config = strategyConfig[strategy];

  const maxDebt = Math.max(initialDebtAmount, ...chartData.map(d => d.totalDebt));
  const debtFreeMonth = chartData.find(d => d.totalDebt <= 0)?.month || chartData[chartData.length - 1]?.month;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>
          <span className={styles.strategyIcon}>{config.icon}</span>
          Progreso de Pago - {config.name}
        </h3>
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: config.color }}
            />
            <span>Deuda Restante</span>
          </div>
          <div className={styles.chartStats}>
            <span className={styles.statItem}>
              📊 Deuda inicial: <strong>{formatCurrency(initialDebtAmount)}</strong>
            </span>
            {Boolean(debtFreeMonth) && (
              <span className={styles.statItem}>
                🎯 Libre de deudas en: <strong>{debtFreeMonth} meses</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border-color)"
              opacity={0.3}
            />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickFormatter={(value) => value === 0 ? 'Inicio' : `M${value}`}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={[0, maxDebt * 1.1]}
            />
            <Tooltip content={<CustomTooltip initialDebtAmount={initialDebtAmount} />} />
            
            {/* Línea de meta (deuda = 0) */}
            <ReferenceLine 
              y={0} 
              stroke="var(--success-color)" 
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            
            {/* Línea principal de progreso */}
            <Line
              type="monotone"
              dataKey="totalDebt"
              stroke={config.color}
              strokeWidth={3}
              dot={{ 
                fill: config.color, 
                strokeWidth: 2, 
                r: 4,
                stroke: '#fff'
              }}
              activeDot={{ 
                r: 6, 
                stroke: config.color,
                strokeWidth: 2,
                fill: '#fff'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartInsights}>
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>📈</div>
          <div className={styles.insightContent}>
            <h4>Velocidad de Progreso</h4>
            <p>
              Con esta estrategia, reducirás tu deuda en aproximadamente{' '}
              <strong>${debtFreeMonth > 0 ? Math.round(initialDebtAmount / debtFreeMonth).toLocaleString() : '0'}</strong> por mes
            </p>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>🎯</div>
          <div className={styles.insightContent}>
            <h4>Meta de Libertad</h4>
            <p>
              Si mantienes este plan, estarás libre de deudas en{' '}
              <strong>{Math.floor(debtFreeMonth / 12)} años y {debtFreeMonth % 12} meses</strong>
            </p>
          </div>
        </div>

        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>💡</div>
          <div className={styles.insightContent}>
            <h4>Motivación Clave</h4>
            <p>
              {strategy === 'snowball' 
                ? 'Celebra cada deuda eliminada. Tu confianza crecerá con cada victoria.' 
                : 'Cada pago reduce significativamente los intereses futuros que pagarás.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
