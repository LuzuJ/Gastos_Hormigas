/**
 * NOTA: Este archivo es temporal y contiene constantes para mantener
 * compatibilidad con el código Firebase antiguo durante la migración a Supabase.
 * Será eliminado cuando la migración esté completa.
 * 
 * @deprecated Usar SUPABASE_TABLES del archivo constants.ts para nuevo código
 */
export const FIRESTORE_PATHS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  EXPENSES: 'expenses',
  FINANCIALS: 'financials',
  FIXED_EXPENSES: 'fixed_expenses',
  SAVINGS_GOALS: 'savings_goals',
  ASSETS: 'assets',
  LIABILITIES: 'liabilities',
  DEBT_PAYMENTS: 'debt_payments',
  PAYMENT_SOURCES: 'payment_sources',
  RECURRING_INCOME: 'recurring_income',
  AUTOMATIC_TRANSACTIONS: 'automatic_transactions',
  FINANCIAL_ALERTS: 'financial_alerts',
  TRANSACTIONS: 'transactions',
  ACHIEVEMENTS: 'achievements',
  USER_STATS: 'user_stats',
  MONTHLY_STATS: 'monthly_stats'
} as const;
