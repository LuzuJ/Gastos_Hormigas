/**
 * Rutas de las páginas de la aplicación.
 * Se usan para la navegación y el renderizado condicional.
 */
export const PAGE_ROUTES = {
  DASHBOARD: 'dashboard',
  REGISTRO: 'registro',
  PLANNING: 'planning',
  ANALYSIS: 'analysis',
  PROFILE: 'profile',
} as const; // 'as const' hace los valores de solo lectura para mayor seguridad

/**
 * Nombres de las colecciones y documentos en Firestore.
 * Centralizar esto previene errores de tipeo al construir las rutas de la base de datos.
 */
export const FIRESTORE_PATHS = {
  ARTIFACTS: 'artifacts',
  USERS: 'users',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  EXPENSES: 'expenses',
  FINANCIALS: 'financials',
  FIXED_EXPENSES: 'fixedExpenses',
  FINANCIALS_SUMMARY_DOC: 'summary',
  SAVINGS_GOALS: 'savingsGoals'
} as const;