import React, { Suspense, ComponentType } from 'react';
import { PageLoader } from '../../layout/PageLoader/PageLoader';
import { ErrorBoundary } from '../../layout/ErrorBoundary/ErrorBoundary';

interface LazyRouteProps {
  component: ComponentType<any>;
  loadingMessage?: string;
  fallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Componente wrapper para lazy loading con manejo de errores
 * Proporciona una interfaz consistente para cargar componentes de forma lazy
 * 
 * @param component - Componente lazy a renderizar
 * @param loadingMessage - Mensaje a mostrar durante la carga
 * @param fallback - Componente fallback personalizado
 * @param props - Props adicionales a pasar al componente
 */
export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  component: Component, 
  loadingMessage = "Cargando...", 
  fallback,
  ...props 
}) => {
  const LoadingFallback = fallback || <PageLoader message={loadingMessage} />;

  return (
    <ErrorBoundary>
      <Suspense fallback={LoadingFallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * HOC para crear rutas lazy con configuración predeterminada
 * 
 * @param importFn - Función de importación dinámica
 * @param loadingMessage - Mensaje personalizado de carga
 */
export const createLazyRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  loadingMessage?: string
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props: any) => (
    <LazyRoute 
      component={LazyComponent} 
      loadingMessage={loadingMessage}
      {...props} 
    />
  );
};

/**
 * Hook para precargar componentes lazy de forma programática
 * Útil para precargar rutas cuando el usuario está a punto de navegar
 */
export const usePreloadRoute = () => {
  const preloadRoute = React.useCallback((importFn: () => Promise<any>) => {
    // Precarga el componente pero no lo renderiza
    importFn().catch(error => {
      console.warn('Error precargando ruta:', error);
    });
  }, []);

  return { preloadRoute };
};
