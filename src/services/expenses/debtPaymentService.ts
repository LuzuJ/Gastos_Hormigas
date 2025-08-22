import type { 
  Liability, 
  DebtPaymentStrategy, 
  DebtAnalysis, 
  DebtPaymentPlan,
  DebtPaymentStrategyType 
} from '../../types';

/**
 * Calcula los meses necesarios para pagar una deuda con interés compuesto
 */
export const calculateMonthsToPayOff = (
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number
): number => {
  if (monthlyPayment <= 0 || balance <= 0) return 0;
  
  const monthlyRate = annualInterestRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }
  
  const minimumPayment = balance * monthlyRate;
  if (monthlyPayment <= minimumPayment) {
    return Infinity; // No se puede pagar nunca
  }
  
  const months = -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
};

/**
 * Calcula el interés total pagado durante el tiempo de vida de la deuda
 */
export const calculateTotalInterest = (
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number
): number => {
  const months = calculateMonthsToPayOff(balance, monthlyPayment, annualInterestRate);
  if (months === Infinity || months === 0) return 0;
  
  return (monthlyPayment * months) - balance;
};

/**
 * Calcula el pago mínimo mensual para una deuda
 */
export const calculateMinimumPayment = (liability: Liability): number => {
  if (liability.monthlyPayment) {
    return liability.monthlyPayment;
  }
  
  // Si no tiene pago mínimo, calculamos un 2% del balance como mínimo
  return Math.max(liability.amount * 0.02, 25);
};

/**
 * Analiza una deuda individual
 */
export const analyzeDebt = (
  liability: Liability,
  extraPayment: number = 0
): DebtAnalysis => {
  const minimumPayment = calculateMinimumPayment(liability);
  const totalPayment = minimumPayment + extraPayment;
  const interestRate = liability.interestRate || 0;
  
  const monthsToPayOff = calculateMonthsToPayOff(
    liability.amount,
    totalPayment,
    interestRate
  );
  
  const totalInterestPaid = calculateTotalInterest(
    liability.amount,
    totalPayment,
    interestRate
  );
  
  return {
    liability,
    monthsToPayOff,
    totalInterestPaid,
    minimumPayment,
    suggestedPayment: totalPayment,
    priority: 0 // Se asignará según la estrategia
  };
};

/**
 * Ordena las deudas según la estrategia de bola de nieve (menor balance primero)
 */
export const sortBySnowball = (debts: DebtAnalysis[]): DebtAnalysis[] => {
  return [...debts].sort((a, b) => a.liability.amount - b.liability.amount);
};

/**
 * Ordena las deudas según la estrategia de avalancha (mayor interés primero)
 */
export const sortByAvalanche = (debts: DebtAnalysis[]): DebtAnalysis[] => {
  return [...debts].sort((a, b) => {
    const interestA = a.liability.interestRate || 0;
    const interestB = b.liability.interestRate || 0;
    return interestB - interestA;
  });
};

/**
 * Crea una estrategia de pago de deudas
 */
export const createPaymentStrategy = (
  type: DebtPaymentStrategyType,
  monthlyExtraBudget: number
): DebtPaymentStrategy => {
  const strategies = {
    snowball: {
      name: 'Bola de Nieve',
      description: 'Paga primero las deudas más pequeñas para obtener victorias rápidas y motivación.'
    },
    avalanche: {
      name: 'Avalancha',
      description: 'Paga primero las deudas con mayor interés para ahorrar más dinero a largo plazo.'
    }
  };
  
  return {
    type,
    name: strategies[type].name,
    description: strategies[type].description,
    monthlyExtraBudget
  };
};

/**
 * Calcula el plan completo de pago de deudas
 */
export const calculateDebtPaymentPlan = (
  liabilities: Liability[],
  strategy: DebtPaymentStrategy
): DebtPaymentPlan => {
  if (liabilities.length === 0) {
    return {
      strategy,
      debts: [],
      totalMonthsToPayOff: 0,
      totalInterestSaved: 0,
      nextDebtToFocus: null,
      monthlyBudgetDistribution: []
    };
  }
  
  // Analizar todas las deudas con pago mínimo
  const debtAnalyses = liabilities.map(liability => analyzeDebt(liability, 0));
  
  // Ordenar según la estrategia
  const sortedDebts = strategy.type === 'snowball' 
    ? sortBySnowball(debtAnalyses)
    : sortByAvalanche(debtAnalyses);
  
  // Asignar prioridades
  const prioritizedDebts = sortedDebts.map((debt, index) => ({
    ...debt,
    priority: index + 1
  }));
  
  // Calcular distribución del presupuesto
  const monthlyBudgetDistribution = prioritizedDebts.map((debt, index) => {
    const extraAmount = index === 0 ? strategy.monthlyExtraBudget : 0;
    return {
      debtId: debt.liability.id,
      amount: debt.minimumPayment + extraAmount,
      type: extraAmount > 0 ? 'extra' as const : 'minimum' as const
    };
  });
  
  // Simular el pago con la estrategia para calcular el tiempo total
  const totalMonthsToPayOff = simulatePaymentStrategy(prioritizedDebts, strategy);
  
  // Calcular interés ahorrado comparando con solo pagos mínimos
  const interestWithMinimumOnly = prioritizedDebts.reduce(
    (total, debt) => total + debt.totalInterestPaid, 0
  );
  
  const interestWithStrategy = calculateInterestWithStrategy(prioritizedDebts, strategy);
  const totalInterestSaved = Math.max(0, interestWithMinimumOnly - interestWithStrategy);
  
  return {
    strategy,
    debts: prioritizedDebts,
    totalMonthsToPayOff,
    totalInterestSaved,
    nextDebtToFocus: prioritizedDebts[0]?.liability || null,
    monthlyBudgetDistribution
  };
};

/**
 * Simula la estrategia de pago para calcular el tiempo total
 */
const simulatePaymentStrategy = (
  debts: DebtAnalysis[],
  strategy: DebtPaymentStrategy
): number => {
  if (debts.length === 0) return 0;
  
  // Simular el pago debt-by-debt con el extra budget reciclado
  let availableExtraBudget = strategy.monthlyExtraBudget;
  let totalMonths = 0;
  
  for (const debt of debts) {
    const totalPayment = debt.minimumPayment + availableExtraBudget;
    const monthsForThisDebt = calculateMonthsToPayOff(
      debt.liability.amount,
      totalPayment,
      debt.liability.interestRate || 0
    );
    
    totalMonths = Math.max(totalMonths, monthsForThisDebt);
    
    // Una vez pagada esta deuda, el pago mínimo se convierte en extra budget
    availableExtraBudget += debt.minimumPayment;
  }
  
  return totalMonths;
};

/**
 * Calcula el interés total con la estrategia aplicada
 */
const calculateInterestWithStrategy = (
  debts: DebtAnalysis[],
  strategy: DebtPaymentStrategy
): number => {
  let availableExtraBudget = strategy.monthlyExtraBudget;
  let totalInterest = 0;
  
  for (const debt of debts) {
    const totalPayment = debt.minimumPayment + availableExtraBudget;
    const interest = calculateTotalInterest(
      debt.liability.amount,
      totalPayment,
      debt.liability.interestRate || 0
    );
    
    totalInterest += interest;
    availableExtraBudget += debt.minimumPayment;
  }
  
  return totalInterest;
};

/**
 * Obtiene mensajes motivacionales según la estrategia
 */
export const getMotivationalMessage = (
  strategy: DebtPaymentStrategy,
  progress: number
): string => {
  const messages = {
    snowball: [
      '¡Cada deuda pequeña que pagas es una victoria! 🎯',
      '¡Vas por buen camino! Las victorias pequeñas generan impulso. ⚡',
      '¡Increíble progreso! La bola de nieve está tomando fuerza. ❄️',
      '¡Casi listo! Cada pago te acerca más a la libertad financiera. 🚀'
    ],
    avalanche: [
      '¡Estrategia inteligente! Estás ahorrando en intereses. 🧠',
      '¡Excelente! Atacar los intereses altos es la jugada correcta. 💡',
      '¡Sigue así! Tu billetera te agradecerá a largo plazo. 💰',
      '¡Casi ahí! Has optimizado tu camino hacia la libertad financiera. 🎯'
    ]
  };
  
  const strategyMessages = messages[strategy.type];
  const messageIndex = Math.min(
    Math.floor(progress * strategyMessages.length),
    strategyMessages.length - 1
  );
  
  return strategyMessages[messageIndex];
};
