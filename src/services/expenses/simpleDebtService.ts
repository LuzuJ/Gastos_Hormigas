import type { Liability } from '../../types';

/**
 * ============================================================================
 * SERVICIO SIMPLIFICADO DE PLANIFICACIÓN DE DEUDAS
 * ============================================================================
 * Enfoque: Cálculos simples y directos sin estrategias complejas
 */

export interface SimpleDebtSummary {
  totalDebt: number;
  totalMonthlyPayments: number;
  highestInterestDebt: Liability | null;
  smallestDebt: Liability | null;
  estimatedMonthsToPayOff: number;
  totalInterestWillPay: number;
}

export interface DebtProgress {
  debtId: string;
  debtName: string;
  currentAmount: number;
  originalAmount: number;
  monthlyPayment: number;
  interestRate: number;
  monthsRemaining: number;
  totalInterestRemaining: number;
  percentagePaid: number;
}

/**
 * Calcula cuántos meses tomará pagar una deuda
 */
export function calculatePayoffMonths(
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number = 0
): number {
  if (balance <= 0) return 0;
  if (monthlyPayment <= 0) return 999; // Número alto si no hay pago
  
  // Sin interés - simple división
  if (annualInterestRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }
  
  // Con interés
  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyInterest = balance * monthlyRate;
  
  // Si el pago no cubre el interés, nunca se pagará
  if (monthlyPayment <= monthlyInterest) {
    return 999;
  }
  
  // Fórmula de amortización
  const months = Math.log(
    monthlyPayment / (monthlyPayment - balance * monthlyRate)
  ) / Math.log(1 + monthlyRate);
  
  return Math.ceil(months);
}

/**
 * Calcula el interés total que se pagará
 */
export function calculateTotalInterest(
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number = 0
): number {
  const months = calculatePayoffMonths(balance, monthlyPayment, annualInterestRate);
  
  if (months >= 999) return 0;
  
  const totalPaid = monthlyPayment * months;
  return Math.max(0, totalPaid - balance);
}

/**
 * Obtiene pago mínimo de una deuda
 */
export function getMonthlyPayment(liability: Liability): number {
  if (liability.monthlyPayment && liability.monthlyPayment > 0) {
    return liability.monthlyPayment;
  }
  
  // 2% del balance como mínimo
  return Math.max(liability.amount * 0.02, 25);
}

/**
 * Calcula resumen simple de todas las deudas
 */
export function calculateSimpleDebtSummary(liabilities: Liability[]): SimpleDebtSummary {
  if (liabilities.length === 0) {
    return {
      totalDebt: 0,
      totalMonthlyPayments: 0,
      highestInterestDebt: null,
      smallestDebt: null,
      estimatedMonthsToPayOff: 0,
      totalInterestWillPay: 0
    };
  }
  
  // Calcular totales
  const totalDebt = liabilities.reduce((sum, d) => sum + d.amount, 0);
  const totalMonthlyPayments = liabilities.reduce(
    (sum, d) => sum + getMonthlyPayment(d), 
    0
  );
  
  // Encontrar deuda con mayor interés
  const highestInterestDebt = liabilities.reduce((max, d) => {
    const rate = d.interestRate || 0;
    const maxRate = max?.interestRate || 0;
    return rate > maxRate ? d : max;
  }, liabilities[0]);
  
  // Encontrar deuda más pequeña
  const smallestDebt = liabilities.reduce((min, d) => {
    return d.amount < min.amount ? d : min;
  }, liabilities[0]);
  
  // Estimar meses para pagar todo
  // Estrategia simple: sumar todos los meses
  const estimatedMonthsToPayOff = liabilities.reduce((total, debt) => {
    const payment = getMonthlyPayment(debt);
    const months = calculatePayoffMonths(
      debt.amount,
      payment,
      debt.interestRate || 0
    );
    return Math.max(total, months); // Usamos max porque se pagan en paralelo
  }, 0);
  
  // Calcular interés total
  const totalInterestWillPay = liabilities.reduce((total, debt) => {
    const payment = getMonthlyPayment(debt);
    const interest = calculateTotalInterest(
      debt.amount,
      payment,
      debt.interestRate || 0
    );
    return total + interest;
  }, 0);
  
  return {
    totalDebt,
    totalMonthlyPayments,
    highestInterestDebt,
    smallestDebt,
    estimatedMonthsToPayOff,
    totalInterestWillPay
  };
}

/**
 * Calcula progreso individual de cada deuda
 */
export function calculateDebtProgress(liability: Liability): DebtProgress {
  const monthlyPayment = getMonthlyPayment(liability);
  const monthsRemaining = calculatePayoffMonths(
    liability.amount,
    monthlyPayment,
    liability.interestRate || 0
  );
  
  const totalInterestRemaining = calculateTotalInterest(
    liability.amount,
    monthlyPayment,
    liability.interestRate || 0
  );
  
  const originalAmount = liability.originalAmount || liability.amount;
  const percentagePaid = originalAmount > 0 
    ? ((originalAmount - liability.amount) / originalAmount) * 100 
    : 0;
  
  return {
    debtId: liability.id,
    debtName: liability.name,
    currentAmount: liability.amount,
    originalAmount,
    monthlyPayment,
    interestRate: liability.interestRate || 0,
    monthsRemaining,
    totalInterestRemaining,
    percentagePaid: Math.max(0, Math.min(100, percentagePaid))
  };
}

/**
 * Simula un pago extra en una deuda
 */
export function simulateExtraPayment(
  currentBalance: number,
  monthlyPayment: number,
  extraPayment: number,
  annualInterestRate: number = 0
): {
  newBalance: number;
  monthsSaved: number;
  interestSaved: number;
} {
  // Meses sin pago extra
  const monthsWithout = calculatePayoffMonths(
    currentBalance,
    monthlyPayment,
    annualInterestRate
  );
  
  const interestWithout = calculateTotalInterest(
    currentBalance,
    monthlyPayment,
    annualInterestRate
  );
  
  // Nuevo balance después del pago extra
  const newBalance = Math.max(0, currentBalance - extraPayment);
  
  // Meses con pago extra
  const monthsWith = calculatePayoffMonths(
    newBalance,
    monthlyPayment,
    annualInterestRate
  );
  
  const interestWith = calculateTotalInterest(
    newBalance,
    monthlyPayment,
    annualInterestRate
  );
  
  return {
    newBalance,
    monthsSaved: Math.max(0, monthsWithout - monthsWith),
    interestSaved: Math.max(0, interestWithout - interestWith)
  };
}

/**
 * Recomienda qué deuda pagar primero
 */
export function recommendNextDebtToPay(liabilities: Liability[]): {
  debt: Liability;
  reason: string;
} | null {
  if (liabilities.length === 0) return null;
  
  // Encontrar deuda con mayor interés
  const highestInterest = liabilities.reduce((max, d) => {
    const rate = d.interestRate || 0;
    const maxRate = max?.interestRate || 0;
    return rate > maxRate ? d : max;
  }, liabilities[0]);
  
  // Encontrar deuda más pequeña
  const smallest = liabilities.reduce((min, d) => {
    return d.amount < min.amount ? d : min;
  }, liabilities[0]);
  
  // Si la deuda más pequeña es menor al 20% de la total, recomendarla
  const totalDebt = liabilities.reduce((sum, d) => sum + d.amount, 0);
  if (smallest.amount < totalDebt * 0.2) {
    return {
      debt: smallest,
      reason: 'Es tu deuda más pequeña. Pagarla te dará una victoria rápida y motivación.'
    };
  }
  
  // Si hay una deuda con interés muy alto (>10%), recomendarla
  if (highestInterest.interestRate && highestInterest.interestRate > 10) {
    return {
      debt: highestInterest,
      reason: `Tiene el interés más alto (${highestInterest.interestRate}%). Pagarla te ahorrará dinero.`
    };
  }
  
  // Por defecto, recomendar la más pequeña
  return {
    debt: smallest,
    reason: 'Comienza con la más pequeña para ganar impulso.'
  };
}

/**
 * Formatea meses en texto legible
 */
export function formatMonths(months: number): string {
  if (months >= 999) return 'Indefinido';
  if (months === 0) return '0 meses';
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  
  return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
}
