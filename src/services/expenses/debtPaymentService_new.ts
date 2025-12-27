import type { 
  Liability, 
  DebtPaymentStrategy, 
  DebtAnalysis, 
  DebtPaymentPlan,
  DebtPaymentStrategyType 
} from '../../types';

/**
 * ============================================================================
 * SERVICIO DE CÁLCULO DE PAGOS DE DEUDA - SIMPLIFICADO Y CORREGIDO
 * ============================================================================
 */

/**
 * Calcula cuántos meses toma pagar una deuda con interés compuesto
 */
export const calculateMonthsToPayOff = (
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number
): number => {
  console.log('[calculateMonthsToPayOff]', { balance, monthlyPayment, annualInterestRate });
  
  // Validaciones básicas
  if (balance <= 0) return 0;
  if (monthlyPayment <= 0) return Infinity;
  
  const monthlyRate = annualInterestRate / 100 / 12;
  
  // Sin interés: simple división
  if (monthlyRate === 0 || annualInterestRate === 0) {
    const months = Math.ceil(balance / monthlyPayment);
    console.log('[calculateMonthsToPayOff] No interest, months:', months);
    return months;
  }
  
  // Con interés: verificar que el pago sea suficiente
  const monthlyInterest = balance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) {
    console.warn('[calculateMonthsToPayOff] Payment too low, will never pay off');
    return Infinity; // El pago no cubre ni el interés
  }
  
  // Fórmula de amortización
  const months = Math.log(monthlyPayment / (monthlyPayment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
  const result = Math.ceil(months);
  
  console.log('[calculateMonthsToPayOff] With interest, months:', result);
  return result;
};

/**
 * Calcula el interés total pagado
 */
export const calculateTotalInterest = (
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number
): number => {
  const months = calculateMonthsToPayOff(balance, monthlyPayment, annualInterestRate);
  
  if (months === Infinity || months === 0) return 0;
  
  const totalPaid = monthlyPayment * months;
  const interest = totalPaid - balance;
  
  return Math.max(0, interest);
};

/**
 * Obtiene el pago mínimo mensual de una deuda
 */
export const getMinimumPayment = (liability: Liability): number => {
  // Si ya tiene pago mínimo definido, usarlo
  if (liability.monthlyPayment && liability.monthlyPayment > 0) {
    return liability.monthlyPayment;
  }
  
  // Si no, calcular 2% del balance (mínimo $25)
  const twoPercent = liability.amount * 0.02;
  return Math.max(twoPercent, 25);
};
