// Los timestamps de Supabase son strings ISO en formato UTC
type SupabaseTimestamp = string;

// Interfaz para las categorías personalizadas
export interface Category {
  id: string;
  name: string;
  isDefault?: boolean; // Indica si es una categoría por defecto
  budget?: number;
  subcategories: SubCategory[];
  icon?: string;
  color?: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

// Interfaz para cada gasto
export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  subCategory: string;
  createdAt: SupabaseTimestamp | null;
  paymentSourceId?: string;  // Nueva propiedad opcional
  assetId?: string;  // Asset del cual se descuenta (para sistema de transacciones)
  assetName?: string;  // Nombre del asset (histórico)
}

// Interfaz para ingresos
export interface Income {
  id: string;
  amount: number;
  description: string;
  category: 'salary' | 'freelance' | 'investment' | 'gift' | 'other';
  assetId?: string;  // Asset donde se deposita
  assetName?: string;  // Nombre del asset (histórico)
  date: SupabaseTimestamp;
  isRecurring: boolean;
  recurrenceFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  recurrenceDay?: number;  // Día del mes o semana
  nextRecurrenceDate?: SupabaseTimestamp;
  createdAt?: SupabaseTimestamp;
  updatedAt?: SupabaseTimestamp;
}

export interface Financials {
  monthlyIncome: number;  // DEPRECATED: Usar tabla incomes
  emergencyFund?: number;
  totalDebt?: number;
}

export interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'categories';
  setCurrentPage: React.Dispatch<React.SetStateAction<'dashboard' | 'categories'>>;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  lastPostedMonth?: string;
}

// Tipos de fuentes de pago
export type PaymentSourceType =
  | 'cash'           // Efectivo
  | 'checking'       // Cuenta corriente
  | 'savings'        // Cuenta de ahorros
  | 'credit_card'    // Tarjeta de crédito
  | 'debit_card'     // Tarjeta débito
  | 'loan'           // Préstamo
  | 'income_salary'  // Salario/ingreso principal
  | 'income_extra'   // Ingreso extra/freelance
  | 'investment'     // Retiro de inversión
  | 'other';         // Otro

// Interfaz para fuentes de pago
export interface PaymentSource {
  id: string;
  name: string;
  type: PaymentSourceType;
  balance?: number;          // Saldo actual (opcional)
  description?: string;      // Descripción adicional
  isActive: boolean;         // Si está activa para usar
  icon?: string;             // Icono personalizado
  color?: string;            // Color para identificación visual
  autoUpdate?: boolean;      // Si se actualiza automáticamente el saldo
  lastUpdated?: SupabaseTimestamp;   // Última actualización del saldo
}

// === RECURRING INCOME TYPES ===

export type RecurringIncomeFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  frequency: RecurringIncomeFrequency;
  startDate: SupabaseTimestamp;
  nextDate: SupabaseTimestamp;        // Próxima fecha de ingreso
  lastProcessed?: SupabaseTimestamp;  // Última vez que se procesó
  paymentSourceId?: string;   // A qué fuente de pago va
  isActive: boolean;
  description?: string;
  category?: 'salary' | 'freelance' | 'business' | 'investment' | 'other';
}

// === AUTOMATIC TRANSACTIONS TYPES ===

export interface AutomaticTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: RecurringIncomeFrequency;
  nextDate: SupabaseTimestamp;
  fromPaymentSourceId?: string;  // De qué fuente sale (para gastos)
  toPaymentSourceId?: string;    // A qué fuente va (para ingresos)
  categoryId?: string;           // Para gastos automáticos
  description?: string;
  isActive: boolean;
  lastProcessed?: SupabaseTimestamp;
}

// === FINANCIAL ALERTS TYPES ===

export type AlertType =
  | 'low_balance'          // Saldo bajo
  | 'upcoming_payment'     // Pago próximo
  | 'debt_reminder'        // Recordatorio de deuda
  | 'budget_exceeded'      // Presupuesto excedido
  | 'savings_opportunity'  // Oportunidad de ahorro
  | 'income_received'      // Ingreso recibido
  | 'goal_achieved';       // Meta alcanzada

export interface FinancialAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: SupabaseTimestamp;
  actionable: boolean;      // Si requiere acción del usuario
  data?: Record<string, any>; // Datos adicionales para la alerta
  expiresAt?: SupabaseTimestamp;    // Cuándo expira la alerta
}

// === ENHANCED EXPENSE TYPE ===

export interface EnhancedExpense extends Expense {
  paymentSourceId?: string;
  balanceAfterTransaction?: number; // Saldo de la fuente después del gasto
  isAutomatic?: boolean;           // Si fue generado automáticamente
  parentTransactionId?: string;    // Si viene de una transacción automática
}

// === FINANCIAL DASHBOARD TYPES ===

export interface FinancialSnapshot {
  date: SupabaseTimestamp;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  cashFlow: number; // Ingresos - Gastos del mes
}

export interface PaymentSourceBalance {
  paymentSourceId: string;
  name: string;
  type: PaymentSourceType;
  currentBalance: number;
  projectedBalance: number; // Proyección considerando transacciones futuras
  lastUpdated: SupabaseTimestamp;
  pendingTransactions: {
    income: number;
    expenses: number;
  };
}

export interface FinancialForecast {
  date: SupabaseTimestamp;
  projectedIncome: number;
  projectedExpenses: number;
  projectedCashFlow: number;
  upcomingPayments: {
    id: string;
    name: string;
    amount: number;
    dueDate: SupabaseTimestamp;
    type: 'debt' | 'fixed_expense' | 'automatic';
  }[];
  alerts: FinancialAlert[];
}

// === TRANSACTION HISTORY ===

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: SupabaseTimestamp;
  fromPaymentSourceId?: string;
  toPaymentSourceId?: string;
  categoryId?: string;
  isAutomatic: boolean;
  relatedId?: string; // ID del gasto, ingreso o transferencia relacionada
}

export type ExpenseFormData = {
  description: string;
  amount: number;
  categoryId: string;
  subCategory: string;
  createdAt: SupabaseTimestamp;
  paymentSourceId?: string;  // Nueva propiedad opcional
};

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export type SavingsGoalFormData = Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>;

export interface UserProfile {
  displayName: string;
  email: string;
  currency: 'USD' | 'EUR' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'PEN'; // Monedas de América y Europa
  avatarUrl?: string;
  theme?: string;
  language?: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  type: 'cash' | 'investment' | 'property'; // Tipos de ejemplo
  description?: string; // Descripción opcional del activo
  lastUpdated?: SupabaseTimestamp; // Fecha de última actualización
}
export type AssetFormData = Omit<Asset, 'id' | 'lastUpdated'>;

export interface Liability {
  id: string;
  name: string;
  amount: number;
  originalAmount?: number; // Monto original de la deuda
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  interestRate?: number; // Tasa de interés anual
  monthlyPayment?: number; // Pago mensual mínimo
  duration?: number; // Duración del préstamo en meses
  dueDate?: string; // Fecha de vencimiento (YYYY-MM-DD)
  description?: string; // Descripción adicional
  lastUpdated?: SupabaseTimestamp; // Fecha de última actualización
  isArchived?: boolean; // Indica si la deuda está archivada (pagada completamente)
  archivedAt?: SupabaseTimestamp; // Fecha cuando se archivó la deuda
}
export type LiabilityFormData = Omit<Liability, 'id' | 'lastUpdated'>;

// === DEBT MANAGEMENT TYPES ===

// Interfaz para pagos de deuda
export interface DebtPayment {
  id: string;
  liabilityId: string;
  amount: number;
  paymentDate: SupabaseTimestamp;
  description?: string;
  paymentType: 'regular' | 'extra' | 'interest_only';
}

// Tipos para estrategias de pago de deudas
export type DebtPaymentStrategyType = 'snowball' | 'avalanche';

// Interfaz para la estrategia de pago
export interface DebtPaymentStrategy {
  type: DebtPaymentStrategyType;
  name: string;
  description: string;
  monthlyExtraBudget: number;
}

// Interfaz para el análisis de una deuda individual
export interface DebtAnalysis {
  liability: Liability;
  monthsToPayOff: number;
  totalInterestPaid: number;
  minimumPayment: number;
  suggestedPayment: number;
  priority: number;
}

// Interfaz para el plan de pago completo
export interface DebtPaymentPlan {
  strategy: DebtPaymentStrategy;
  debts: DebtAnalysis[];
  totalMonthsToPayOff: number;
  totalInterestSaved: number;
  nextDebtToFocus: Liability | null;
  monthlyBudgetDistribution: {
    debtId: string;
    amount: number;
    type: 'minimum' | 'extra';
  }[];
}

// === ACHIEVEMENTS & GAMIFICATION TYPES ===

export type AchievementCategory = 'budget' | 'savings' | 'debt' | 'income' | 'general';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string; // Emoji o icono
  points: number; // Puntos que otorga el logro
  requirement: {
    type: 'budget_streak' | 'savings_goal' | 'debt_payment' | 'expense_reduction' | 'income_increase' | 'net_worth_growth';
    value: number; // Valor requerido para desbloquear
    period?: 'monthly' | 'yearly' | 'total'; // Período de evaluación
  };
  isUnlocked: boolean;
  unlockedAt?: SupabaseTimestamp;
  progress: number; // Progreso actual hacia el logro (0-100)
}

export interface UserStats {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  currentStreak: {
    budgetStreak: number; // Meses consecutivos sin superar presupuesto
    savingsStreak: number; // Meses consecutivos ahorrando
  };
  monthlyStats: {
    month: string; // YYYY-MM format
    budgetCompliance: number; // Porcentaje de cumplimiento de presupuesto
    savingsRate: number; // Porcentaje de ahorro del ingreso
    expenseReduction: number; // Reducción de gastos vs mes anterior
  }[];
}