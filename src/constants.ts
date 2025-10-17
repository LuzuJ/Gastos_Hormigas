/**
 * Rutas de las páginas de la aplicación.
 * Se usan para la navegación y el renderizado condicional.
 */
export const PAGE_ROUTES = {
  DASHBOARD: 'dashboard',
  REGISTRO: 'registro',
  PLANNING: 'planning',
  ANALYSIS: 'analysis',
  REPORTS: 'reports',
  BUDGET: 'budget',
  PROFILE: 'profile',
} as const; // 'as const' hace los valores de solo lectura para mayor seguridad

/**
 * Nombres de las tablas en Supabase PostgreSQL.
 * Centralizar esto previene errores de tipeo al construir las consultas SQL.
 */
export const SUPABASE_TABLES = {
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
  MONTHLY_STATS: 'monthly_stats',
} as const;

export const defaultCategoriesStructure = [
    { name: 'Alimento', icon: 'Pizza', color: '#FFC300', subcategories: ['Supermercado', 'Restaurante', 'Delivery'] },
    { name: 'Transporte', icon: 'Car', color: '#FF5733', subcategories: ['Gasolina', 'Transporte Público', 'Taxi/Uber'] },
    { name: 'Hogar', icon: 'Home', color: '#C70039', subcategories: ['Servicios (Luz, Agua)', 'Decoración', 'Reparaciones'] },
    { name: 'Entretenimiento', icon: 'Gamepad2', color: '#900C3F', subcategories: ['Suscripciones', 'Cine', 'Salidas'] },
    { name: 'Salud', icon: 'HeartPulse', color: '#581845', subcategories: ['Farmacia', 'Consulta Médica'] },
    { name: 'Otro', icon: 'ShoppingBag', color: '#2a9d8f', subcategories: ['General'] }
];