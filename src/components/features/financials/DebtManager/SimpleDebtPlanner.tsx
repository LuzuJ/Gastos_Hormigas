import React from 'react';
import type { Liability } from '../../../../types';
import {
  calculateSimpleDebtSummary,
  calculateDebtProgress,
  recommendNextDebtToPay,
  formatMonths,
  simulateExtraPayment,
  getMonthlyPayment
} from '../../../../services/expenses/simpleDebtService';
import { formatCurrency } from '../../../../utils/formatters';
import styles from './SimpleDebtPlanner.module.css';

interface SimpleDebtPlannerProps {
  debts: Liability[];
  onMakePayment: (debtId: string, amount: number) => void;
}

// Función para generar consejos inteligentes
const generateSmartTips = (debts: Liability[], summary: any) => {
  const tips = [];
  
  // Consejo sobre intereses altos
  const highInterestDebt = debts.find(d => (d.interestRate || 0) > 15);
  if (highInterestDebt) {
    tips.push({
      icon: '🔥',
      title: 'Prioriza intereses altos',
      text: `"${highInterestDebt.name}" tiene ${highInterestDebt.interestRate}% de interés. Cada mes que pasa, pagas más dinero solo en intereses.`,
      action: 'Considera pagar más del mínimo en esta deuda para ahorrar en intereses.'
    });
  }
  
  // Consejo sobre método avalancha vs bola de nieve
  if (debts.length > 1) {
    const smallestDebt = debts.reduce((min, d) => d.amount < min.amount ? d : min, debts[0]);
    tips.push({
      icon: '⚡',
      title: 'Victoria rápida',
      text: `"${smallestDebt.name}" es tu deuda más pequeña (${formatCurrency(smallestDebt.amount)}).`,
      action: 'Pagarla primero te dará motivación y liberará dinero para las demás.'
    });
  }
  
  // Consejo sobre pagos extra
  if (summary.totalInterestWillPay > 1000) {
    tips.push({
      icon: '💪',
      title: 'Ahorra en intereses',
      text: `Vas a pagar ${formatCurrency(summary.totalInterestWillPay)} solo en intereses.`,
      action: 'Cualquier pago extra reduce significativamente este costo. Incluso $50 extras al mes hacen diferencia.'
    });
  }
  
  // Consejo sobre tiempo de pago
  if (summary.estimatedMonthsToPayOff > 36) {
    tips.push({
      icon: '⏰',
      title: 'Acelera tu libertad financiera',
      text: `Con tus pagos actuales, tardarás ${formatMonths(summary.estimatedMonthsToPayOff)} en estar libre de deudas.`,
      action: 'Intenta aumentar tus pagos mensuales aunque sea un poco. Verás la diferencia.'
    });
  }
  
  return tips;
};

export const SimpleDebtPlanner: React.FC<SimpleDebtPlannerProps> = ({
  debts,
  onMakePayment
}) => {
  const [selectedDebtId, setSelectedDebtId] = React.useState<string | null>(null);
  const [manualPaymentAmount, setManualPaymentAmount] = React.useState<string>('');

  if (debts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎉</div>
        <h3>¡Sin deudas!</h3>
        <p>No tienes deudas registradas. ¡Excelente trabajo!</p>
      </div>
    );
  }

  const summary = calculateSimpleDebtSummary(debts);
  const recommendation = recommendNextDebtToPay(debts);
  const debtsWithProgress = debts.map(calculateDebtProgress);
  const smartTips = generateSmartTips(debts, summary);

  const selectedDebt = selectedDebtId 
    ? debts.find(d => d.id === selectedDebtId) 
    : null;

  return (
    <div className={styles.container}>
      {/* RESUMEN GENERAL */}
      <div className={styles.summarySection}>
        <h2 className={styles.title}>
          <span>💰</span> Resumen de Deudas
        </h2>
        
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.cardLabel}>Deuda Total</div>
            <div className={styles.cardValue}>{formatCurrency(summary.totalDebt)}</div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.cardLabel}>Pago Mensual Total</div>
            <div className={styles.cardValue}>{formatCurrency(summary.totalMonthlyPayments)}</div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.cardLabel}>Tiempo Estimado</div>
            <div className={styles.cardValue}>{formatMonths(summary.estimatedMonthsToPayOff)}</div>
          </div>
          
          <div className={styles.summaryCard}>
            <div className={styles.cardLabel}>Intereses a Pagar</div>
            <div className={styles.cardValue}>{formatCurrency(summary.totalInterestWillPay)}</div>
          </div>
        </div>
      </div>

      {/* RECOMENDACIÓN */}
      {recommendation && (
        <div className={styles.recommendation}>
          <div className={styles.recIcon}>💡</div>
          <div>
            <div className={styles.recTitle}>Recomendación</div>
            <div className={styles.recDebt}>{recommendation.debt.name}</div>
            <div className={styles.recReason}>{recommendation.reason}</div>
          </div>
        </div>
      )}

      {/* CONSEJOS INTELIGENTES */}
      {smartTips.length > 0 && (
        <div className={styles.tipsSection}>
          <h3 className={styles.tipsTitle}>
            <span>🎯</span> Consejos para pagar más rápido
          </h3>
          <div className={styles.tipsGrid}>
            {smartTips.map((tip) => (
              <div key={`${tip.icon}-${tip.title}`} className={styles.tipCard}>
                <div className={styles.tipIcon}>{tip.icon}</div>
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>{tip.title}</div>
                  <div className={styles.tipText}>{tip.text}</div>
                  <div className={styles.tipAction}>{tip.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTA DE DEUDAS */}
      <div className={styles.debtsList}>
        <h3 className={styles.sectionTitle}>Tus Deudas</h3>
        
        {debtsWithProgress.map((progress) => {
          const debt = debts.find(d => d.id === progress.debtId)!;
          const isRecommended = recommendation?.debt.id === debt.id;
          
          return (
            <div 
              key={progress.debtId} 
              className={`${styles.debtCard} ${isRecommended ? styles.recommended : ''}`}
            >
              <div className={styles.debtHeader}>
                <div>
                  <h4 className={styles.debtName}>
                    {progress.debtName}
                    {isRecommended && <span className={styles.recommendedBadge}>⭐ Recomendada</span>}
                  </h4>
                  <div className={styles.debtType}>{debt.type || 'Deuda'}</div>
                </div>
                <div className={styles.debtAmount}>
                  {formatCurrency(progress.currentAmount)}
                </div>
              </div>

              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress.percentagePaid}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {progress.percentagePaid.toFixed(1)}% pagado
              </div>

              <div className={styles.debtDetails}>
                <div className={styles.detailRow}>
                  <span>Pago mensual:</span>
                  <strong>{formatCurrency(progress.monthlyPayment)}</strong>
                </div>
                
                {progress.interestRate > 0 && (
                  <div className={styles.detailRow}>
                    <span>Tasa de interés:</span>
                    <strong>{progress.interestRate.toFixed(2)}%</strong>
                  </div>
                )}
                
                <div className={styles.detailRow}>
                  <span>Tiempo restante:</span>
                  <strong>{formatMonths(progress.monthsRemaining)}</strong>
                </div>
                
                {progress.totalInterestRemaining > 0 && (
                  <div className={styles.detailRow}>
                    <span>Intereses restantes:</span>
                    <strong className={styles.interest}>
                      {formatCurrency(progress.totalInterestRemaining)}
                    </strong>
                  </div>
                )}
              </div>

              <div className={styles.debtActions}>
                <button
                  onClick={() => onMakePayment(debt.id, progress.monthlyPayment)}
                  className={styles.btnPrimary}
                >
                  💳 Pagar Mínimo ({formatCurrency(progress.monthlyPayment)})
                </button>
                
                <button
                  onClick={() => setSelectedDebtId(debt.id)}
                  className={styles.btnManual}
                >
                  💰 Pago Manual
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE PAGO MANUAL */}
      {selectedDebt && (
        <div className={styles.modal} onClick={() => setSelectedDebtId(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>💰 Pago Manual - {selectedDebt.name}</h3>
              <button onClick={() => setSelectedDebtId(null)} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <span className={styles.infoIcon}>ℹ️</span>
                <div>
                  <strong>Pago Manual:</strong> Ingresa cualquier cantidad que desees pagar.
                  Este pago se aplicará directamente al balance de la deuda.
                </div>
              </div>
              
              <div className={styles.currentBalance}>
                <span>Balance actual:</span>
                <strong>{formatCurrency(selectedDebt.amount)}</strong>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="payment-amount">Cantidad a pagar:</label>
                <input
                  id="payment-amount"
                  type="number"
                  value={manualPaymentAmount}
                  onChange={(e) => setManualPaymentAmount(e.target.value)}
                  onWheel={(e) => e.preventDefault()}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  className={styles.input}
                  min="0"
                  max={selectedDebt.amount}
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  const amount = Number.parseFloat(manualPaymentAmount) || 0;
                  if (amount > 0 && amount <= selectedDebt.amount) {
                    onMakePayment(selectedDebt.id, amount);
                    setSelectedDebtId(null);
                    setManualPaymentAmount('');
                  }
                }}
                disabled={!manualPaymentAmount || Number.parseFloat(manualPaymentAmount) <= 0 || Number.parseFloat(manualPaymentAmount) > selectedDebt.amount}
                className={styles.btnConfirm}
              >
                💰 Realizar Pago
              </button>
              
              <button
                onClick={() => {
                  setSelectedDebtId(null);
                  setManualPaymentAmount('');
                }}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
