import React, { useState, useMemo } from 'react';
import styles from './DebtPaymentPlanner.module.css';
import type { Liability } from '../../types';
import DebtMotivationCard from './DebtMotivationCard';
import { 
  Snowflake, 
  Mountain, 
  Calculator, 
  Target, 
  TrendingDown, 
  Clock, 
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface DebtPaymentPlannerProps {
  liabilities: Liability[];
  monthlyExtraBudget: number;
  onUpdateExtraBudget: (amount: number) => void;
  onApplyStrategy: (strategy: PaymentStrategy) => void;
}

type PaymentStrategyType = 'snowball' | 'avalanche' | 'custom';

interface PaymentStrategy {
  type: PaymentStrategyType;
  name: string;
  description: string;
  priorityOrder: string[]; // IDs de deudas en orden de prioridad
  monthlyExtraPayment: number;
  estimatedMonthsToPayoff: number;
  totalInterestSaved: number;
}

interface DebtAnalysis {
  liability: Liability;
  monthlyPayment: number;
  estimatedMonths: number;
  totalInterest: number;
  priorityScore: number;
}

const DebtPaymentPlanner: React.FC<DebtPaymentPlannerProps> = ({
  liabilities,
  monthlyExtraBudget,
  onUpdateExtraBudget,
  onApplyStrategy
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<PaymentStrategyType>('snowball');
  const [showCalculations, setShowCalculations] = useState(false);

  // Análisis de deudas para cada estrategia
  const debtAnalysis = useMemo(() => {
    return liabilities.map(liability => {
      const monthlyPayment = liability.monthlyPayment || Math.max(liability.amount * 0.02, 25); // Mínimo 2% o $25
      const interestRate = (liability.interestRate || 0) / 100 / 12; // Tasa mensual
      
      // Cálculo estimado de meses para pagar (sin pagos extra)
      let estimatedMonths = 0;
      if (interestRate > 0) {
        estimatedMonths = Math.ceil(
          -Math.log(1 - (liability.amount * interestRate) / monthlyPayment) / Math.log(1 + interestRate)
        );
      } else {
        estimatedMonths = Math.ceil(liability.amount / monthlyPayment);
      }

      // Cálculo de interés total
      const totalPayments = estimatedMonths * monthlyPayment;
      const totalInterest = Math.max(0, totalPayments - liability.amount);

      // Score de prioridad para cada estrategia
      const priorityScore = {
        snowball: -liability.amount, // Menor deuda primero (negativo para ordenar ascendente)
        avalanche: -(liability.interestRate || 0), // Mayor interés primero (negativo para ordenar descendente)
        custom: 0
      };

      return {
        liability,
        monthlyPayment,
        estimatedMonths: isFinite(estimatedMonths) ? estimatedMonths : 999,
        totalInterest,
        priorityScore: priorityScore[selectedStrategy]
      };
    });
  }, [liabilities, selectedStrategy]);

  // Estrategias de pago calculadas
  const paymentStrategies = useMemo(() => {
    const strategies: PaymentStrategy[] = [];

    // Estrategia Bola de Nieve (Snowball)
    const snowballOrder = [...debtAnalysis]
      .sort((a, b) => a.liability.amount - b.liability.amount)
      .map(d => d.liability.id);

    strategies.push({
      type: 'snowball',
      name: 'Bola de Nieve',
      description: 'Paga primero las deudas más pequeñas para obtener victorias rápidas y motivación.',
      priorityOrder: snowballOrder,
      monthlyExtraPayment: monthlyExtraBudget,
      estimatedMonthsToPayoff: calculatePayoffTime(snowballOrder),
      totalInterestSaved: calculateInterestSaved(snowballOrder)
    });

    // Estrategia Avalancha (Avalanche)
    const avalancheOrder = [...debtAnalysis]
      .sort((a, b) => (b.liability.interestRate || 0) - (a.liability.interestRate || 0))
      .map(d => d.liability.id);

    strategies.push({
      type: 'avalanche',
      name: 'Avalancha',
      description: 'Paga primero las deudas con mayor interés para minimizar el costo total.',
      priorityOrder: avalancheOrder,
      monthlyExtraPayment: monthlyExtraBudget,
      estimatedMonthsToPayoff: calculatePayoffTime(avalancheOrder),
      totalInterestSaved: calculateInterestSaved(avalancheOrder)
    });

    return strategies;
  }, [debtAnalysis, monthlyExtraBudget]);

  function calculatePayoffTime(priorityOrder: string[]): number {
    let totalMonths = 0;
    let extraBudget = monthlyExtraBudget;
    
    priorityOrder.forEach(debtId => {
      const debt = debtAnalysis.find(d => d.liability.id === debtId);
      if (!debt) return;

      const totalMonthlyPayment = debt.monthlyPayment + extraBudget;
      const interestRate = (debt.liability.interestRate || 0) / 100 / 12;
      
      let months = 0;
      if (interestRate > 0) {
        months = Math.ceil(
          -Math.log(1 - (debt.liability.amount * interestRate) / totalMonthlyPayment) / 
          Math.log(1 + interestRate)
        );
      } else {
        months = Math.ceil(debt.liability.amount / totalMonthlyPayment);
      }

      totalMonths = Math.max(totalMonths, months);
      // Una vez pagada esta deuda, el presupuesto extra se suma al siguiente
      extraBudget += debt.monthlyPayment;
    });

    return isFinite(totalMonths) ? totalMonths : 999;
  }

  function calculateInterestSaved(priorityOrder: string[]): number {
    // Comparar con el escenario de pagos mínimos
    const baseInterest = debtAnalysis.reduce((total, debt) => total + debt.totalInterest, 0);
    
    let strategyInterest = 0;
    let extraBudget = monthlyExtraBudget;

    priorityOrder.forEach(debtId => {
      const debt = debtAnalysis.find(d => d.liability.id === debtId);
      if (!debt) return;

      const totalMonthlyPayment = debt.monthlyPayment + extraBudget;
      const interestRate = (debt.liability.interestRate || 0) / 100 / 12;
      
      if (interestRate > 0) {
        const months = Math.ceil(
          -Math.log(1 - (debt.liability.amount * interestRate) / totalMonthlyPayment) / 
          Math.log(1 + interestRate)
        );
        const totalPayments = isFinite(months) ? months * totalMonthlyPayment : debt.liability.amount;
        strategyInterest += Math.max(0, totalPayments - debt.liability.amount);
      }

      extraBudget += debt.monthlyPayment;
    });

    return Math.max(0, baseInterest - strategyInterest);
  }

  const handleStrategySelect = (strategy: PaymentStrategy) => {
    setSelectedStrategy(strategy.type);
    onApplyStrategy(strategy);
  };

  // Calcular datos para la tarjeta de motivación
  const motivationData = useMemo(() => {
    const totalDebt = liabilities.reduce((sum, debt) => sum + debt.amount, 0);
    const totalOriginalDebt = liabilities.reduce((sum, debt) => sum + (debt.originalAmount || debt.amount), 0);
    const totalPaid = totalOriginalDebt - totalDebt;
    
    const selectedStrategyData = paymentStrategies.find(s => s.type === selectedStrategy);
    
    // Encontrar la próxima deuda a pagar según la estrategia
    const nextDebtId = selectedStrategyData?.priorityOrder.find(debtId => {
      const debt = liabilities.find(l => l.id === debtId);
      return debt && debt.amount > 0;
    });
    
    const nextDebt = nextDebtId ? liabilities.find(l => l.id === nextDebtId) : null;
    
    return {
      totalDebt: totalOriginalDebt,
      totalPaid,
      estimatedMonthsRemaining: selectedStrategyData?.estimatedMonthsToPayoff || 0,
      interestSaved: selectedStrategyData?.totalInterestSaved || 0,
      strategyName: selectedStrategyData?.name,
      nextMilestone: nextDebt ? {
        debtName: nextDebt.name,
        amount: nextDebt.amount,
        estimatedCompletion: new Date(Date.now() + (selectedStrategyData?.estimatedMonthsToPayoff || 0) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      } : undefined
    };
  }, [liabilities, selectedStrategy, paymentStrategies]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const getStrategyIcon = (type: PaymentStrategyType) => {
    switch (type) {
      case 'snowball': return <Snowflake size={24} />;
      case 'avalanche': return <Mountain size={24} />;
      default: return <Target size={24} />;
    }
  };

  if (liabilities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <AlertCircle size={48} />
          <h3>No hay deudas para planificar</h3>
          <p>Agrega algunas deudas primero para usar el planificador de pagos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            <Calculator size={24} />
            Planificador de Pago de Deudas
          </h2>
          <p className={styles.subtitle}>
            Optimiza tu estrategia de pago para liberarte de deudas más rápido
          </p>
        </div>
      </div>

      {/* Tarjeta de motivación */}
      <DebtMotivationCard
        totalDebt={motivationData.totalDebt}
        totalPaid={motivationData.totalPaid}
        estimatedMonthsRemaining={motivationData.estimatedMonthsRemaining}
        interestSaved={motivationData.interestSaved}
        strategyName={motivationData.strategyName}
        nextMilestone={motivationData.nextMilestone}
      />

      {/* Configuración de presupuesto extra */}
      <div className={styles.budgetSection}>
        <div className={styles.budgetHeader}>
          <DollarSign size={20} />
          <h3>Presupuesto Extra Mensual</h3>
        </div>
        <div className={styles.budgetInput}>
          <input
            type="number"
            value={monthlyExtraBudget}
            onChange={(e) => onUpdateExtraBudget(Number(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={styles.input}
          />
          <span className={styles.inputLabel}>USD adicionales por mes</span>
        </div>
        <p className={styles.budgetHelp}>
          Cantidad extra que puedes destinar mensualmente al pago de deudas
        </p>
      </div>

      {/* Estrategias de pago */}
      <div className={styles.strategiesSection}>
        <div className={styles.strategiesHeader}>
          <BarChart3 size={20} />
          <h3>Estrategias de Pago</h3>
          <button
            onClick={() => setShowCalculations(!showCalculations)}
            className={styles.toggleButton}
          >
            {showCalculations ? 'Ocultar' : 'Ver'} Cálculos
          </button>
        </div>

        <div className={styles.strategiesGrid}>
          {paymentStrategies.map((strategy) => (
            <div
              key={strategy.type}
              className={`${styles.strategyCard} ${
                selectedStrategy === strategy.type ? styles.selected : ''
              }`}
              onClick={() => handleStrategySelect(strategy)}
            >
              <div className={styles.strategyHeader}>
                <div className={styles.strategyIcon}>
                  {getStrategyIcon(strategy.type)}
                </div>
                <div className={styles.strategyInfo}>
                  <h4 className={styles.strategyName}>{strategy.name}</h4>
                  <p className={styles.strategyDescription}>{strategy.description}</p>
                </div>
              </div>

              <div className={styles.strategyMetrics}>
                <div className={styles.metric}>
                  <Clock size={16} />
                  <span className={styles.metricLabel}>Tiempo estimado:</span>
                  <span className={styles.metricValue}>
                    {strategy.estimatedMonthsToPayoff} meses
                  </span>
                </div>
                <div className={styles.metric}>
                  <TrendingDown size={16} />
                  <span className={styles.metricLabel}>Interés ahorrado:</span>
                  <span className={styles.metricValue}>
                    {formatCurrency(strategy.totalInterestSaved)}
                  </span>
                </div>
              </div>

              {selectedStrategy === strategy.type && (
                <div className={styles.selectedIndicator}>
                  <CheckCircle2 size={16} />
                  Estrategia seleccionada
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Orden de pago y cálculos detallados */}
      {showCalculations && selectedStrategy && (
        <div className={styles.calculationsSection}>
          <h3 className={styles.calculationsTitle}>
            Plan de Pago Detallado - {paymentStrategies.find(s => s.type === selectedStrategy)?.name}
          </h3>
          
          <div className={styles.paymentOrder}>
            {paymentStrategies
              .find(s => s.type === selectedStrategy)
              ?.priorityOrder.map((debtId, index) => {
                const debt = debtAnalysis.find(d => d.liability.id === debtId);
                if (!debt) return null;

                return (
                  <div key={debtId} className={styles.paymentStep}>
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepHeader}>
                        <h4 className={styles.debtName}>{debt.liability.name}</h4>
                        <span className={styles.debtAmount}>
                          {formatCurrency(debt.liability.amount)}
                        </span>
                      </div>
                      <div className={styles.stepDetails}>
                        <div className={styles.stepDetail}>
                          <span>Pago mensual mínimo:</span>
                          <span>{formatCurrency(debt.monthlyPayment)}</span>
                        </div>
                        {debt.liability.interestRate && (
                          <div className={styles.stepDetail}>
                            <span>Tasa de interés:</span>
                            <span>{debt.liability.interestRate}% anual</span>
                          </div>
                        )}
                        <div className={styles.stepDetail}>
                          <span>Tiempo estimado:</span>
                          <span>{debt.estimatedMonths} meses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className={styles.strategyTips}>
            <h4>Consejos para esta estrategia:</h4>
            {selectedStrategy === 'snowball' && (
              <ul>
                <li>Concéntrate en pagar la deuda más pequeña primero</li>
                <li>Haz pagos mínimos en todas las demás deudas</li>
                <li>Una vez pagada la primera deuda, aplica ese pago a la siguiente</li>
                <li>Celebra cada deuda pagada para mantener la motivación</li>
              </ul>
            )}
            {selectedStrategy === 'avalanche' && (
              <ul>
                <li>Prioriza la deuda con la tasa de interés más alta</li>
                <li>Haz pagos mínimos en todas las demás deudas</li>
                <li>Aplica todo el dinero extra a la deuda de mayor interés</li>
                <li>Continúa con la siguiente deuda de mayor interés</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtPaymentPlanner;
