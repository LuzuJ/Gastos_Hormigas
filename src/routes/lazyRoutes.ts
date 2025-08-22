import { createLazyRoute } from '../components/common/LazyRoute/LazyRoute';

/**
 * Configuración de rutas lazy con code splitting optimizado
 * Cada ruta se carga solo cuando es necesaria, mejorando el rendimiento inicial
 */

// Importaciones lazy para las páginas principales
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

// Funciones de precarga para optimizar la experiencia del usuario
export const preloadRoutes = {
  dashboard: () => import('../pages/DashboardPage'),
  reports: () => import('../pages/ReportsPage'),
  planning: () => import('../pages/PlanningPage'),
  registro: () => import('../pages/RegistroPage'),
  profile: () => import('../pages/ProfilePage'),
  categories: () => import('../pages/ManageCategoriesPage'),
  budget: () => import('../pages/BudgetPage'),
};

// Mapa de rutas para facilitar el preloading basado en la navegación del usuario
export const ROUTE_PRELOAD_MAP = {
  '/dashboard': ['reports', 'registro'],
  '/reports': ['dashboard', 'planning'],
  '/planning': ['dashboard', 'reports'],
  '/registro': ['dashboard'],
  '/profile': ['dashboard'],
  '/categories': ['dashboard'],
  '/budget': ['dashboard', 'planning'],
} as const;

/**
 * Función para precargar rutas de forma inteligente
 */
export const preloadRoutesFor = (currentPage: string) => {
  const routesToPreload = ROUTE_PRELOAD_MAP[currentPage as keyof typeof ROUTE_PRELOAD_MAP];
  
  if (routesToPreload) {
    routesToPreload.forEach(route => {
      const preloadFn = preloadRoutes[route as keyof typeof preloadRoutes];
      if (preloadFn) {
        setTimeout(() => {
          preloadFn().catch(error => {
            console.warn(`Error precargando ruta ${route}:`, error);
          });
        }, 1000);
      }
    });
  }
};
