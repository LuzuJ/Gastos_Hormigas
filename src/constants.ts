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
  SAVINGS_GOALS: 'savingsGoals',
  ASSETS: 'assets',
  LIABILITIES: 'liabilities',
  DEBT_PAYMENTS: 'debtPayments',
} as const;

export const defaultCategoriesStructure = [
    { name: 'Alimento', icon: 'Pizza', color: '#FFC300', subcategories: ['Supermercado', 'Restaurante', 'Delivery'] },
    { name: 'Transporte', icon: 'Car', color: '#FF5733', subcategories: ['Gasolina', 'Transporte Público', 'Taxi/Uber'] },
    { name: 'Hogar', icon: 'Home', color: '#C70039', subcategories: ['Servicios (Luz, Agua)', 'Decoración', 'Reparaciones'] },
    { name: 'Entretenimiento', icon: 'Gamepad2', color: '#900C3F', subcategories: ['Suscripciones', 'Cine', 'Salidas'] },
    { name: 'Salud', icon: 'HeartPulse', color: '#581845', subcategories: ['Farmacia', 'Consulta Médica'] },
    { name: 'Otro', icon: 'ShoppingBag', color: '#2a9d8f', subcategories: ['General'] }
];