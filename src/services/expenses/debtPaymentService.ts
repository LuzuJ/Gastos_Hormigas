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
 * CORREGIDO: Ahora asigna correctamente el presupuesto extra solo a la primera deuda
 */
export const calculateDebtPaymentPlan = (
  liabilities: Liability[],
  strategy: DebtPaymentStrategy
): DebtPaymentPlan => {
  console.log('[calculateDebtPaymentPlan] 🎯 Starting calculation:', {
    liabilitiesCount: liabilities.length,
    strategyType: strategy.type,
    monthlyExtraBudget: strategy.monthlyExtraBudget
  });
  
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
  
  // 1. Analizar todas las deudas con pago mínimo
  const debtAnalyses = liabilities.map(liability => analyzeDebt(liability, 0));
  
  // 2. Ordenar según la estrategia
  const sortedDebts = strategy.type === 'snowball' 
    ? sortBySnowball(debtAnalyses)
    : sortByAvalanche(debtAnalyses);
  
  console.log('[calculateDebtPaymentPlan] Debt order:', 
    sortedDebts.map((d, i) => `${i+1}. ${d.liability.name} ($${d.liability.amount})`)  );
  
  // 3. Asignar prioridades y suggested payments
  const prioritizedDebts = sortedDebts.map((debt, index) => {
    // Solo la PRIMERA deuda recibe el presupuesto extra
    const extraPayment = index === 0 ? strategy.monthlyExtraBudget : 0;
    const suggestedPayment = debt.minimumPayment + extraPayment;
    
    return {
      ...debt,
      priority: index + 1,
      suggestedPayment
    };
  });
  
  // 4. Calcular distribución del presupuesto
  const monthlyBudgetDistribution = prioritizedDebts.map((debt, index) => {
    const extraAmount = index === 0 ? strategy.monthlyExtraBudget : 0;
    return {
      debtId: debt.liability.id,
      amount: debt.minimumPayment + extraAmount,
      type: extraAmount > 0 ? 'extra' as const : 'minimum' as const
    };
  });
  
  // 5. Simular el pago con la estrategia
  const totalMonthsToPayOff = simulatePaymentStrategy(prioritizedDebts, strategy);
  
  // 6. Calcular interés ahorrado
  const interestWithMinimumOnly = prioritizedDebts.reduce(
    (total, debt) => total + debt.totalInterestPaid, 0
  );
  
  const interestWithStrategy = calculateInterestWithStrategy(prioritizedDebts, strategy);
  const totalInterestSaved = Math.max(0, interestWithMinimumOnly - interestWithStrategy);
  
  console.log('[calculateDebtPaymentPlan] ✅ Plan complete:', {
    totalMonthsToPayOff,
    totalInterestSaved,
    nextDebtToFocus: prioritizedDebts[0]?.liability.name
  });
  
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
 * CORREGIDO: Ahora acumula meses secuencialmente y recicla presupuesto correctamente
 */
const simulatePaymentStrategy = (
  debts: DebtAnalysis[],
  strategy: DebtPaymentStrategy
): number => {
  if (debts.length === 0) return 0;
  
  console.log('[simulatePaymentStrategy] 🎯 Starting simulation:', {
    strategyType: strategy.type,
    monthlyExtraBudget: strategy.monthlyExtraBudget,
    debtsCount: debts.length,
    debts: debts.map(d => ({
      name: d.liability.name,
      amount: d.liability.amount,
      minimumPayment: d.minimumPayment,
      interestRate: d.liability.interestRate
    }))
  });
  
  let availableExtraBudget = strategy.monthlyExtraBudget;
  let totalMonths = 0;
  
  for (let i = 0; i < debts.length; i++) {
    const debt = debts[i];
    const minimumPayment = debt.minimumPayment;
    
    // Aplicar presupuesto extra SOLO a la deuda enfocada (la primera)
    const extraForThisDebt = (i === 0) ? availableExtraBudget : 0;
    const totalPayment = minimumPayment + extraForThisDebt;
    
    const monthsForThisDebt = calculateMonthsToPayOff(
      debt.liability.amount,
      totalPayment,
      debt.liability.interestRate || 0
    );
    
    console.log(`[simulatePaymentStrategy] 📊 Debt #${i+1}: ${debt.liability.name}`, {
      amount: debt.liability.amount,
      minimumPayment,
      extraApplied: extraForThisDebt,
      totalPayment,
      monthsForThisDebt,
      isInfinity: monthsForThisDebt === Infinity
    });
    
    if (monthsForThisDebt === Infinity || monthsForThisDebt < 0) {
      console.warn(`[⚠️ simulatePaymentStrategy] Cannot pay ${debt.liability.name} with current budget`);
      return Infinity;
    }
    
    // ACUMULAR meses (pagar deudas secuencialmente)
    totalMonths += monthsForThisDebt;
    
    // Una vez pagada esta deuda, liberar su pago mínimo como extra budget
    // IMPORTANTE: Esto solo afecta a la SIGUIENTE deuda enfocada
    availableExtraBudget += minimumPayment;
    
    console.log(`[simulatePaymentStrategy] After paying ${debt.liability.name}:`, {
      monthsPaidSoFar: totalMonths,
      newExtraBudget: availableExtraBudget
    });
  }
  
  console.log('[simulatePaymentStrategy] ✅ Total months to pay all debts:', totalMonths);
  
  return totalMonths;
};

/**
 * Calcula el interés total con la estrategia aplicada
 * CORREGIDO: Aplica presupuesto extra solo a la primera deuda
 */
const calculateInterestWithStrategy = (
  debts: DebtAnalysis[],
  strategy: DebtPaymentStrategy
): number => {
  let availableExtraBudget = strategy.monthlyExtraBudget;
  let totalInterest = 0;
  
  for (let i = 0; i < debts.length; i++) {
    const debt = debts[i];
    
    // Solo la primera deuda recibe extra budget
    const extraForThisDebt = (i === 0) ? availableExtraBudget : 0;
    const totalPayment = debt.minimumPayment + extraForThisDebt;
    
    const interest = calculateTotalInterest(
      debt.liability.amount,
      totalPayment,
      debt.liability.interestRate || 0
    );
    
    totalInterest += interest;
    
    // Liberar pago mínimo como extra budget para la siguiente
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
