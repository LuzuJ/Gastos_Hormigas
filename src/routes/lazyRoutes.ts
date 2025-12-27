import { createLazyRoute } from '../components/common/LazyRoute/LazyRoute';

/**
 * 🚀 Sistema de Code Splitting Avanzado
 * - Lazy loading de páginas y componentes grandes
 * - Preloading inteligente basado en navegación
 * - Error boundaries para componentes fallidos
 * - Prefetch de datos relacionados
 */

// ===== PÁGINAS PRINCIPALES =====
export const DashboardPage = createLazyRoute(
  () => import('../pages/DashboardPage').then(module => ({
    default: module.DashboardPage
  })),
  "Cargando Dashboard..."
);

export const ReportsPage = createLazyRoute(
  () => import('../pages/ReportsPage').then(module => ({
    default: module.ReportsPage
  })),
  "Cargando Reportes..."
);

export const PlanningPage = createLazyRoute(
  () => import('../pages/PlanningPage').then(module => ({
    default: module.PlanningPage
  })),
  "Cargando Planificación..."
);

export const RegistroPage = createLazyRoute(
  () => import('../pages/RegistroPage').then(module => ({
    default: module.RegistroPage
  })),
  "Cargando Registro..."
);

export const LoginPage = createLazyRoute(
  () => import('../pages/LoginPage').then(module => ({
    default: module.LoginPage
  })),
  "Cargando..."
);

export const AuthCallbackPage = createLazyRoute(
  () => import('../pages/AuthCallbackPage').then(module => ({
    default: module.default
  })),
  "Completando autenticación..."
);

export const ProfilePage = createLazyRoute(
  () => import('../pages/ProfilePage').then(module => ({
    default: module.ProfilePage
  })),
  "Cargando Perfil..."
);

export const ManageCategoriesPage = createLazyRoute(
  () => import('../pages/ManageCategoriesPage').then(module => ({
    default: module.ManageCategoriesPage
  })),
  "Cargando Categorías..."
);

export const BudgetPage = createLazyRoute(
  () => import('../pages/BudgetPage'),
  "Cargando Presupuestos..."
);

export const IncomesPage = createLazyRoute(
  () => import('../pages/IncomesPage').then(module => ({
    default: module.IncomesPage
  })),
  "Cargando Ingresos..."
);

export const StatsPage = createLazyRoute(
  () => import('../pages/StatsPage').then(module => ({
    default: module.StatsPage
  })),
  "Cargando Estadísticas..."
);

// ===== COMPONENTES GRANDES - CODE SPLITTING =====
export const ExpenseChart = createLazyRoute(
  () => import('../components/charts/ExpenseChart/ExpenseChart').then(module => ({
    default: module.ExpenseChart
  })),
  "Cargando gráfico..."
);

export const AchievementsPage = createLazyRoute(
  () => import('../components/pages/AchievementsPage/AchievementsPage').then(module => ({
    default: module.AchievementsPage
  })),
  "Cargando logros..."
);

export const DuplicateDetectionDemo = createLazyRoute(
  () => import('../components/DuplicateDetectionDemo/DuplicateDetectionDemo').then(module => ({
    default: module.DuplicateDetectionDemo
  })),
  "Cargando detector de duplicados..."
);

// ===== SISTEMA DE PRELOADING INTELIGENTE =====

// Cache de módulos precargados
const preloadCache = new Map<string, Promise<any>>();

// Función para precargar con cache
const preloadWithCache = (key: string, importFn: () => Promise<any>) => {
  if (!preloadCache.has(key)) {
    preloadCache.set(key, importFn().catch(error => {
      console.warn(`Error precargando ${key}:`, error);
      preloadCache.delete(key); // Remover del cache si falla
      return null;
    }));
  }
  return preloadCache.get(key);
};

// Funciones de precarga por categoría
export const preloadRoutes = {
  // Páginas principales
  dashboard: () => preloadWithCache('dashboard', () => import('../pages/DashboardPage')),
  reports: () => preloadWithCache('reports', () => import('../pages/ReportsPage')),
  planning: () => preloadWithCache('planning', () => import('../pages/PlanningPage')),
  registro: () => preloadWithCache('registro', () => import('../pages/RegistroPage')),
  profile: () => preloadWithCache('profile', () => import('../pages/ProfilePage')),
  categories: () => preloadWithCache('categories', () => import('../pages/ManageCategoriesPage')),
  budget: () => preloadWithCache('budget', () => import('../pages/BudgetPage')),

  // Componentes grandes
  charts: () => Promise.all([
    preloadWithCache('expense-chart', () => import('../components/charts/ExpenseChart/ExpenseChart'))
  ]),

  // Funcionalidades avanzadas
  advanced: () => Promise.all([
    preloadWithCache('achievements', () => import('../components/pages/AchievementsPage/AchievementsPage'))
  ]),

  // Herramientas de análisis
  analysis: () => Promise.all([
    preloadWithCache('duplicate-detection', () => import('../components/DuplicateDetectionDemo/DuplicateDetectionDemo'))
  ])
};

// Estrategias de preloading basadas en comportamiento del usuario
export const PRELOAD_STRATEGIES = {
  '/dashboard': {
    immediate: ['registro', 'charts'], // Cargar inmediatamente
    delayed: ['reports', 'planning'],  // Cargar después de 2s
    onHover: ['budget', 'profile']     // Cargar cuando hover en navegación
  },
  '/reports': {
    immediate: ['charts', 'analysis'],
    delayed: ['dashboard', 'planning'],
    onHover: ['export-manager']
  },
  '/planning': {
    immediate: ['advanced'],
    delayed: ['dashboard', 'reports'],
    onHover: ['budget']
  },
  '/registro': {
    immediate: ['dashboard'],
    delayed: ['charts'],
    onHover: []
  },
  '/profile': {
    immediate: [],
    delayed: ['dashboard'],
    onHover: ['categories']
  }
} as const;

/**
 * 🧠 Preloading inteligente basado en la página actual
 */
export const preloadRoutesFor = (currentPage: string) => {
  const strategy = PRELOAD_STRATEGIES[currentPage as keyof typeof PRELOAD_STRATEGIES];

  if (!strategy) return;

  // 1. Cargar recursos inmediatos
  strategy.immediate.forEach(resource => {
    const preloadFn = preloadRoutes[resource as keyof typeof preloadRoutes];
    if (preloadFn) {
      preloadFn();
    }
  });

  // 2. Cargar recursos diferidos (después de 2s)
  setTimeout(() => {
    strategy.delayed.forEach(resource => {
      const preloadFn = preloadRoutes[resource as keyof typeof preloadRoutes];
      if (preloadFn) {
        preloadFn();
      }
    });
  }, 2000);

  // 3. Configurar preloading on hover para navegación
  setTimeout(() => {
    setupHoverPreloading(strategy.onHover);
  }, 1000);
};

/**
 * 🎯 Configurar preloading cuando el usuario hace hover en elementos de navegación
 */
const setupHoverPreloading = (resources: readonly string[]) => {
  resources.forEach(resource => {
    const navElements = document.querySelectorAll(`[data-preload="${resource}"]`);

    navElements.forEach(element => {
      let timeoutId: NodeJS.Timeout;

      const handleMouseEnter = () => {
        timeoutId = setTimeout(() => {
          const preloadFn = preloadRoutes[resource as keyof typeof preloadRoutes];
          if (preloadFn) {
            preloadFn();
          }
        }, 300); // Delay para evitar preloads accidentales
      };

      const handleMouseLeave = () => {
        clearTimeout(timeoutId);
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    });
  });
};

/**
 * 📊 Monitoreo de performance del code splitting
 */
export const logPreloadMetrics = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    console.log('📊 Code Splitting Metrics:', {
      'First Contentful Paint': navigation.loadEventEnd - navigation.fetchStart,
      'Modules in Cache': preloadCache.size,
      'Cache Hit Rate': preloadCache.size > 0 ? '✅' : '⚠️'
    });
  }
};

// Hook para limpiar cache cuando sea necesario
export const clearPreloadCache = () => {
  preloadCache.clear();
  console.log('🧹 Preload cache cleared');
};
