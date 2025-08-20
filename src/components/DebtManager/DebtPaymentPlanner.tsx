import React, { useState, useCallback, useMemo } from 'react';
import { useDebtPaymentStrategies } from '../../hooks/useDebtPaymentStrategies';
import { DebtMotivationCard } from './DebtMotivationCard';
import { DebtProgressChart } from './DebtProgressChart';
import type { Liability } from '../../types';
import styles from './DebtPaymentPlanner.module.css';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button/Button';

interface DebtPaymentPlannerProps {
  debts: Liability[];
  onMakePayment: (debtId: string, amount: number) => void;
}

export const DebtPaymentPlanner: React.FC<DebtPaymentPlannerProps> = ({
  debts,
  onMakePayment
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  
  const {
    currentStrategy,
    paymentPlan,
    setStrategyType,
    setMonthlyExtraBudget,
    compareStrategies,
    getProgress,
    getMotivationalMessage,
    getTotalDebtAmount,
    getTotalMonthlyMinimums
  } = useDebtPaymentStrategies(debts);

  // Actualizar el presupuesto extra cuando cambie el input
  React.useEffect(() => {
    setMonthlyExtraBudget(monthlyBudget);
  }, [monthlyBudget, setMonthlyExtraBudget]);

  const comparison = useMemo(() => compareStrategies(), [compareStrategies]);
  
  // Generar cronograma de pagos detallado
  const generatePaymentSchedule = useCallback(() => {
    if (!paymentPlan || monthlyBudget <= 0) return [];
    
    const schedule = [];
    let remainingDebts = [...paymentPlan.debts];
    let currentMonth = 1;
    
    while (remainingDebts.length > 0 && currentMonth <= 60) { // Máximo 5 años
      const monthData = {
        month: currentMonth,
        payments: [] as Array<{
          debtId: string;
          debtName: string;
          payment: number;
          principal: number;
          interest: number;
          remainingBalance: number;
        }>,
        totalPaid: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        remainingDebt: 0
      };
      
      remainingDebts = remainingDebts.filter(debt => debt.liability.amount > 0);
      
      for (const debt of remainingDebts) {
        const monthlyRate = (debt.liability.interestRate || 0) / 100 / 12;
        const interestPayment = debt.liability.amount * monthlyRate;
        const payment = Math.min(debt.suggestedPayment, debt.liability.amount + interestPayment);
        const principalPayment = payment - interestPayment;
        
        debt.liability.amount = Math.max(0, debt.liability.amount - principalPayment);
        
        monthData.payments.push({
          debtId: debt.liability.id,
          debtName: debt.liability.name,
          payment,
          principal: principalPayment,
          interest: interestPayment,
          remainingBalance: debt.liability.amount
        });
        
        monthData.totalPaid += payment;
        monthData.totalPrincipal += principalPayment;
        monthData.totalInterest += interestPayment;
      }
      
      // Calcular deuda total restante
      monthData.remainingDebt = remainingDebts.reduce((sum, debt) => sum + debt.liability.amount, 0);
      
      schedule.push(monthData);
      currentMonth++;
      
      if (remainingDebts.every(debt => debt.liability.amount <= 0)) break;
    }
    
    return schedule.slice(0, 12); // Mostrar solo los próximos 12 meses en la tabla
  }, [paymentPlan, monthlyBudget]);

  // Generar datos completos para el gráfico (toda la progresión)
  const generateChartData = useCallback(() => {
    if (!paymentPlan || monthlyBudget <= 0) return [];
    
    const schedule = [];
    let remainingDebts = [...paymentPlan.debts.map(d => ({ ...d, liability: { ...d.liability } }))]; // Deep copy
    let currentMonth = 1;
    let totalPaidAccumulated = 0;
    
    while (remainingDebts.length > 0 && currentMonth <= 240) { // Hasta 20 años para el gráfico
      let monthlyPaid = 0;
      let totalRemainingDebt = 0;
      
      remainingDebts = remainingDebts.filter(debt => debt.liability.amount > 0);
      
      for (const debt of remainingDebts) {
        const monthlyRate = (debt.liability.interestRate || 0) / 100 / 12;
        const interestPayment = debt.liability.amount * monthlyRate;
        const payment = Math.min(debt.suggestedPayment, debt.liability.amount + interestPayment);
        const principalPayment = payment - interestPayment;
        
        debt.liability.amount = Math.max(0, debt.liability.amount - principalPayment);
        monthlyPaid += payment;
      }
      
      totalRemainingDebt = remainingDebts.reduce((sum, debt) => sum + debt.liability.amount, 0);
      totalPaidAccumulated += monthlyPaid;
      
      schedule.push({
        month: currentMonth,
        totalPaid: totalPaidAccumulated,
        remainingDebt: totalRemainingDebt
      });
      
      currentMonth++;
      
      if (remainingDebts.every(debt => debt.liability.amount <= 0)) break;
    }
    
    return schedule;
  }, [paymentPlan, monthlyBudget]);

  const paymentSchedule = useMemo(() => generatePaymentSchedule(), [generatePaymentSchedule]);
  const chartData = useMemo(() => generateChartData(), [generateChartData]);
  const initialDebtAmount = useMemo(() => getTotalDebtAmount(), [getTotalDebtAmount]);

  const handleMakePayment = useCallback((debtId: string, amount: number) => {
    onMakePayment(debtId, amount);
  }, [onMakePayment]);

  const formatMonths = (months: number): string => {
    if (months === Infinity) return 'Nunca';
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }
    
    return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
  };

  if (debts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📊</div>
        <h3 className={styles.emptyTitle}>No hay deudas registradas</h3>
        <p className={styles.emptyDescription}>
          Agrega algunas deudas para comenzar a planificar tu estrategia de pago.
        </p>
      </div>
    );
  }

  const totalMinimums = getTotalMonthlyMinimums();
  const availableForExtra = Math.max(0, monthlyBudget - totalMinimums);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🎯</span>{' '}
          Planificador Inteligente de Pagos
        </h2>
        <p className={styles.subtitle}>
          Optimiza tu estrategia de pago y libérate de deudas más rápido
        </p>
      </div>
      
      {/* Configuración Principal */}
      <div className={styles.strategyConfig}>
        <div className={styles.configGrid}>
          {/* Selección de Estrategia */}
          <div className={styles.strategySelection}>
            <h3 className={styles.sectionTitle}>
              <span>⚡</span>{' '}
              Estrategia de Pago
            </h3>
            <div className={styles.strategyOptions}>
              <Button
                variant={currentStrategy.type === 'snowball' ? 'primary' : 'outline'}
                size="large"
                onClick={() => setStrategyType('snowball')}
                className={styles.strategyButton}
              >
                <div className={styles.strategyIcon}>❄️</div>
                <div className={styles.strategyInfo}>
                  <div className={styles.strategyName}>Bola de Nieve</div>
                  <div className={styles.strategyDesc}>
                    Primero las deudas con menor saldo para ganar impulso psicológico
                  </div>
                </div>
              </Button>
              <Button
                variant={currentStrategy.type === 'avalanche' ? 'primary' : 'outline'}
                size="large"
                onClick={() => setStrategyType('avalanche')}
                className={styles.strategyButton}
              >
                <div className={styles.strategyIcon}>🏔️</div>
                <div className={styles.strategyInfo}>
                  <div className={styles.strategyName}>Avalancha</div>
                  <div className={styles.strategyDesc}>
                    Primero las deudas con mayor interés para ahorrar más dinero
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Configuración de Presupuesto */}
          <div className={styles.budgetConfig}>
            <h3 className={styles.sectionTitle}>
              <span>💰</span>{' '}
              Presupuesto Mensual
            </h3>
            <div className={styles.budgetInputGroup}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={monthlyBudget || ''}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={styles.budgetInput}
              />
              <span className={styles.currency}>€</span>
            </div>
            
            {monthlyBudget > 0 && (
              <div className={styles.budgetInfo}>
                <div className={styles.budgetStat}>
                  <span>Pagos mínimos:</span>
                  <span>{formatCurrency(totalMinimums)}</span>
                </div>
                <div className={styles.budgetStat}>
                  <span>Disponible extra:</span>
                  <span className={availableForExtra > 0 ? styles.positive : styles.negative}>
                    {formatCurrency(availableForExtra)}
                  </span>
                </div>
              </div>
            )}
            
            {monthlyBudget > 0 && availableForExtra < 0 && (
              <div className={styles.warningMessage}>
                <span>⚠️</span>{' '}
                Tu presupuesto es menor que los pagos mínimos requeridos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultados y Análisis */}
      {monthlyBudget > 0 && paymentPlan && availableForExtra >= 0 && (
        <>
          {/* Tarjeta de Motivación */}
          <DebtMotivationCard 
            paymentPlan={paymentPlan}
            progress={getProgress()}
            motivationalMessage={getMotivationalMessage()}
            totalDebtAmount={getTotalDebtAmount()}
          />

          {/* Resumen de Estrategia */}
          <div className={styles.summaryCard}>
            <h3 className={styles.sectionTitle}>
              <span>📊</span>
              {' '}
              Resumen de tu Estrategia {currentStrategy.type === 'snowball' ? 'Bola de Nieve' : 'Avalancha'}
            </h3>
            
            <div className={styles.summaryGrid}>
              <div className={styles.summaryMetric}>
                <div className={styles.metricIcon}>⏱️</div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Tiempo para liquidar</span>
                  <span className={styles.metricValue}>{formatMonths(paymentPlan.totalMonthsToPayOff)}</span>
                </div>
              </div>
              
              <div className={styles.summaryMetric}>
                <div className={styles.metricIcon}>💸</div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Intereses ahorrados</span>
                  <span className={styles.metricValue}>{formatCurrency(paymentPlan.totalInterestSaved)}</span>
                </div>
              </div>
              
              <div className={styles.summaryMetric}>
                <div className={styles.metricIcon}>💰</div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Total a pagar</span>
                  <span className={styles.metricValue}>{formatCurrency(getTotalDebtAmount())}</span>
                </div>
              </div>
              
              <div className={styles.summaryMetric}>
                <div className={styles.metricIcon}>📈</div>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Progreso actual</span>
                  <span className={styles.metricValue}>{Math.round(getProgress() * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación de Secciones */}
          <div className={styles.sectionTabs}>
            <Button
              variant={!showComparison && !showPaymentSchedule ? 'primary' : 'outline'}
              className={styles.tab}
              onClick={() => {
                setShowComparison(false);
                setShowPaymentSchedule(false);
              }}
            >
              📋 Plan de Pago
            </Button>
            <Button
              variant={showComparison ? 'primary' : 'outline'}
              className={styles.tab}
              onClick={() => {
                setShowComparison(!showComparison);
                setShowPaymentSchedule(false);
              }}
            >
              ⚖️ Comparar Estrategias
            </Button>
            <Button
              variant={showPaymentSchedule ? 'primary' : 'outline'}
              className={styles.tab}
              onClick={() => {
                setShowPaymentSchedule(!showPaymentSchedule);
                setShowComparison(false);
              }}
            >
              📅 Cronograma Detallado
            </Button>
          </div>

          {/* Sección Principal - Plan de Pago */}
          {!showComparison && !showPaymentSchedule && (
            <div className={styles.paymentPlan}>
              <h3 className={styles.sectionTitle}>
                <span>🎯</span>
                {' '}
                Orden de Pago Recomendado
              </h3>
              
              <div className={styles.debtList}>
                {paymentPlan.debts.map((debtAnalysis, index) => (
                  <div 
                    key={debtAnalysis.liability.id} 
                    className={`${styles.debtCard} ${index === 0 ? styles.focused : ''}`}
                  >
                    <div className={styles.debtHeader}>
                      <div className={styles.debtName}>
                        <span className={styles.priority}>#{index + 1}</span>
                        <h4>{debtAnalysis.liability.name}</h4>
                        {index === 0 && <span className={styles.focusLabel}>ENFOQUE ACTUAL</span>}
                      </div>
                      <div className={styles.debtAmount}>
                        {formatCurrency(debtAnalysis.liability.amount)}
                      </div>
                    </div>
                    
                    <div className={styles.debtDetails}>
                      <div className={styles.debtStat}>
                        <span className={styles.statLabel}>Interés</span>
                        <span className={styles.statValue}>{debtAnalysis.liability.interestRate || 0}%</span>
                      </div>
                      <div className={styles.debtStat}>
                        <span className={styles.statLabel}>Pago mínimo</span>
                        <span className={styles.statValue}>{formatCurrency(debtAnalysis.minimumPayment)}</span>
                      </div>
                      <div className={styles.debtStat}>
                        <span className={styles.statLabel}>Pago sugerido</span>
                        <span className={styles.statValue}>{formatCurrency(debtAnalysis.suggestedPayment)}</span>
                      </div>
                      <div className={styles.debtStat}>
                        <span className={styles.statLabel}>Tiempo estimado</span>
                        <span className={styles.statValue}>
                          {formatMonths(debtAnalysis.liability.amount / debtAnalysis.suggestedPayment)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.paymentActions}>
                      <Button
                        onClick={() => handleMakePayment(debtAnalysis.liability.id, debtAnalysis.minimumPayment)}
                        variant="outline"
                        className={styles.paymentButton}
                      >
                        💳 Pagar Mínimo
                      </Button>
                      <Button
                        onClick={() => handleMakePayment(debtAnalysis.liability.id, debtAnalysis.suggestedPayment)}
                        variant="primary"
                        className={styles.paymentButton}
                      >
                        🚀 Pago Sugerido
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfico de Progreso */}
              <DebtProgressChart 
                paymentSchedule={chartData}
                strategy={currentStrategy.type}
                initialDebtAmount={initialDebtAmount}
              />
            </div>
          )}

          {/* Sección de Comparación */}
          {showComparison && (
            <div className={styles.comparison}>
              <h3 className={styles.sectionTitle}>
                <span>⚖️</span>
                {' '}
                Comparación de Estrategias
              </h3>
              
              <div className={styles.comparisonGrid}>
                <div className={`${styles.comparisonCard} ${currentStrategy.type === 'snowball' ? styles.active : ''}`}>
                  <div className={styles.comparisonTitle}>
                    <span>❄️</span>
                    {' '}
                    Bola de Nieve
                  </div>
                  <p className={styles.comparisonDesc}>Menor saldo primero - Victoria psicológica</p>
                  <div className={styles.comparisonStats}>
                    <div className={styles.comparisonStat}>
                      <span>Tiempo:</span>
                      <span>{formatMonths(comparison.snowball.totalMonthsToPayOff)}</span>
                    </div>
                    <div className={styles.comparisonStat}>
                      <span>Intereses ahorrados:</span>
                      <span>{formatCurrency(comparison.snowball.totalInterestSaved)}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.comparisonCard} ${currentStrategy.type === 'avalanche' ? styles.active : ''}`}>
                  <div className={styles.comparisonTitle}>
                    <span>🏔️</span>
                    {' '}
                    Avalancha
                  </div>
                  <p className={styles.comparisonDesc}>Mayor interés primero - Ahorro máximo</p>
                  <div className={styles.comparisonStats}>
                    <div className={styles.comparisonStat}>
                      <span>Tiempo:</span>
                      <span>{formatMonths(comparison.avalanche.totalMonthsToPayOff)}</span>
                    </div>
                    <div className={styles.comparisonStat}>
                      <span>Intereses ahorrados:</span>
                      <span>{formatCurrency(comparison.avalanche.totalInterestSaved)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.recommendation}>
                <div className={styles.recommendationIcon}>💡</div>
                <div className={styles.recommendationContent}>
                  <h4>Recomendación Personalizada</h4>
                  <p>
                    {comparison.avalanche.totalInterestSaved > comparison.snowball.totalInterestSaved
                      ? `La estrategia Avalancha te ahorrará ${formatCurrency(
                          comparison.avalanche.totalInterestSaved - comparison.snowball.totalInterestSaved
                        )} más en intereses.`
                      : 'Ambas estrategias tienen resultados similares. Elige la que más te motive.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Cronograma */}
          {showPaymentSchedule && (
            <div className={styles.scheduleSection}>
              <h3 className={styles.sectionTitle}>
                <span>📅</span>
                {' '}
                Cronograma de Pagos (Próximos 12 meses)
              </h3>
              
              <div className={styles.scheduleGrid}>
                {paymentSchedule.slice(0, 6).map((month) => (
                  <div key={month.month} className={styles.monthCard}>
                    <div className={styles.monthHeader}>
                      <span className={styles.monthNumber}>Mes {month.month}</span>
                      <span className={styles.monthTotal}>{formatCurrency(month.totalPaid)}</span>
                    </div>
                    
                    <div className={styles.monthBreakdown}>
                      <div className={styles.breakdownItem}>
                        <span>Principal:</span>
                        <span>{formatCurrency(month.totalPrincipal)}</span>
                      </div>
                      <div className={styles.breakdownItem}>
                        <span>Intereses:</span>
                        <span>{formatCurrency(month.totalInterest)}</span>
                      </div>
                    </div>
                    
                    <div className={styles.monthPayments}>
                      {month.payments.slice(0, 2).map((payment) => (
                        <div key={payment.debtId} className={styles.paymentItem}>
                          <span className={styles.debtNameSmall}>{payment.debtName}</span>
                          <span className={styles.paymentAmount}>{formatCurrency(payment.payment)}</span>
                        </div>
                      ))}
                      {month.payments.length > 2 && (
                        <div className={styles.morePayments}>
                          +{month.payments.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Estado de presupuesto vacío */}
      {monthlyBudget === 0 && (
        <div className={styles.prompt}>
          <div className={styles.promptIcon}>💡</div>
          <div className={styles.promptContent}>
            <h3>¡Comienza tu planificación!</h3>
            <p>Ingresa tu presupuesto mensual para ver tu plan de pago personalizado.</p>
          </div>
        </div>
      )}

      {/* Estado de presupuesto insuficiente */}
      {monthlyBudget > 0 && availableForExtra < 0 && (
        <div className={styles.insufficientBudget}>
          <div className={styles.warningIcon}>⚠️</div>
          <div className={styles.warningContent}>
            <h3>Presupuesto Insuficiente</h3>
            <p>
              Necesitas al menos {formatCurrency(totalMinimums)} para cubrir los pagos mínimos.
              Considera aumentar tus ingresos o reestructurar tus deudas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
