import React, { Suspense, ComponentType, lazy } from 'react';
import { PageLoader } from '../../layout/PageLoader/PageLoader';
import { ErrorBoundary } from '../../layout/ErrorBoundary/ErrorBoundary';

interface LazyRouteProps {
  component: ComponentType<any>;
  loadingMessage?: string;
  fallback?: React.ReactNode;
  [key: string]: any;
}

interface LazyRouteOptions {
  /** Mensaje de loading personalizado */
  loadingMessage?: string;
  /** Componente de loading personalizado */
  LoadingComponent?: ComponentType;
  /** Timeout para mostrar error si la carga demora mucho */
  timeout?: number;
  /** Callback cuando el componente se carga exitosamente */
  onLoadSuccess?: () => void;
  /** Callback cuando falla la carga */
  onLoadError?: (error: Error) => void;
  /** Prefetch automático después de X ms */
  prefetchAfter?: number;
}

// ===== CACHE Y MÉTRICAS GLOBALES =====
const componentCache = new Map<string, Promise<any>>();
const loadMetrics = new Map<string, { loadTime: number; loadCount: number }>();

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
 * 🚀 Factory avanzado para crear componentes lazy con optimizaciones
 * HOC para crear rutas lazy con configuración predeterminada
 * 
 * @param importFn - Función de importación dinámica
 * @param loadingMessage - Mensaje personalizado de carga
 * @param options - Opciones avanzadas de configuración
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  loadingMessage?: string,
  options?: LazyRouteOptions
) {
  const componentKey = importFn.toString();
  
  // Crear el componente lazy con cache y métricas
  const LazyComponent = lazy(() => {
    const startTime = performance.now();
    
    // Verificar cache primero
    if (componentCache.has(componentKey)) {
      return componentCache.get(componentKey)!;
    }

    // Crear la promesa de carga con timeout
    const loadPromise = Promise.race([
      importFn().then(module => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Actualizar métricas de performance
        const currentMetrics = loadMetrics.get(componentKey) || { loadTime: 0, loadCount: 0 };
        loadMetrics.set(componentKey, {
          loadTime: (currentMetrics.loadTime + loadTime) / (currentMetrics.loadCount + 1),
          loadCount: currentMetrics.loadCount + 1
        });
        
        // Callback de éxito
        options?.onLoadSuccess?.();
        
        // Normalizar la respuesta del módulo
        if ('default' in module) {
          return module;
        } else {
          return { default: module as T };
        }
      }),
      
      // Timeout de carga (opcional)
      ...(options?.timeout ? [
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            const error = new Error(`Timeout loading component after ${options.timeout}ms`);
            options?.onLoadError?.(error);
            reject(error);
          }, options.timeout);
        })
      ] : [])
    ]).catch(error => {
      console.error('Error loading lazy component:', error);
      options?.onLoadError?.(error);
      throw error;
    });

    // Guardar en cache
    componentCache.set(componentKey, loadPromise);
    
    return loadPromise;
  });

  // Componente wrapper con todas las funcionalidades
  const LazyRouteWrapper: ComponentType<any> = (props) => {
    const LoadingComponent = options?.LoadingComponent || PageLoader;
    const message = loadingMessage || options?.loadingMessage || 'Cargando...';

    return (
      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center min-h-[200px] p-8">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️ Error al cargar el componente</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Recargar página
              </button>
            </div>
          </div>
        }
      >
        <Suspense 
          fallback={
            options?.LoadingComponent ? 
              <options.LoadingComponent /> : 
              <LoadingComponent message={message} />
          }
        >
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Añadir método de prefetch al componente
  (LazyRouteWrapper as any).prefetch = () => {
    if (!componentCache.has(componentKey)) {
      try {
        importFn().then(() => {
          console.log(`✅ Prefetched component`);
        }).catch(error => {
          console.warn(`⚠️ Failed to prefetch component:`, error);
        });
      } catch (error) {
        console.warn(`⚠️ Error prefetching component:`, error);
      }
    }
  };

  // Configurar prefetch automático
  if (options?.prefetchAfter && options.prefetchAfter > 0) {
    setTimeout(() => {
      (LazyRouteWrapper as any).prefetch();
    }, options.prefetchAfter);
  }

  return LazyRouteWrapper;
}

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

/**
 * 🧠 Hook avanzado para precargar componentes de forma inteligente
 */
export function useLazyRoutePreloader() {
  const preloadComponent = React.useCallback((
    importFn: () => Promise<any>,
    priority: 'high' | 'low' = 'low'
  ) => {
    const delay = priority === 'high' ? 0 : 1000;
    
    setTimeout(() => {
      importFn().catch(error => {
        console.warn('Error preloading component:', error);
      });
    }, delay);
  }, []);

  return { preloadComponent };
}

/**
 * 📊 Hook para obtener métricas de carga de componentes lazy
 */
export function useLazyRouteMetrics() {
  const getMetrics = React.useCallback(() => {
    const metrics = Array.from(loadMetrics.entries()).map(([key, data]) => ({
      component: key.slice(0, 50) + '...',
      averageLoadTime: Math.round(data.loadTime),
      loadCount: data.loadCount
    }));

    return {
      totalComponents: metrics.length,
      cachedComponents: componentCache.size,
      metrics: metrics.sort((a, b) => b.averageLoadTime - a.averageLoadTime)
    };
  }, []);

  const clearCache = React.useCallback(() => {
    componentCache.clear();
    loadMetrics.clear();
    console.log('🧹 Lazy route cache cleared');
  }, []);

  return { getMetrics, clearCache };
}

/**
 * 🎯 Componente para mostrar métricas de lazy loading (solo desarrollo)
 */
export const LazyRouteMetrics: React.FC = () => {
  const { getMetrics } = useLazyRouteMetrics();
  const [metrics, setMetrics] = React.useState(getMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">📊 Lazy Routes</h4>
      <div className="mb-2">
        <div>Total: {metrics.totalComponents}</div>
        <div>Cached: {metrics.cachedComponents}</div>
      </div>
      <div className="max-h-32 overflow-y-auto">
        {metrics.metrics.slice(0, 5).map((metric, index) => (
          <div key={index} className="text-xs opacity-80">
            {metric.component}: {metric.averageLoadTime}ms ({metric.loadCount}x)
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== UTILIDADES ADICIONALES =====
export const LazyRouteUtils = {
  /**
   * Precargar múltiples rutas de forma escalonada
   */
  preloadRoutes: (importFunctions: Array<() => Promise<any>>) => {
    importFunctions.forEach((importFn, index) => {
      setTimeout(() => {
        importFn().catch(console.warn);
      }, index * 100); // Escalonar las cargas cada 100ms
    });
  },

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats: () => ({
    size: componentCache.size,
    keys: Array.from(componentCache.keys()).map(key => key.slice(0, 50) + '...')
  }),

  /**
   * Limpiar cache selectivamente por patrón
   */
  clearCacheFor: (pattern: string) => {
    const keysToDelete = Array.from(componentCache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => {
      componentCache.delete(key);
      loadMetrics.delete(key);
    });
    console.log(`🧹 Cleared cache for pattern: ${pattern} (${keysToDelete.length} items)`);
  }
};
