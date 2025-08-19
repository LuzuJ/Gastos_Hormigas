/**
 * Hook de utilidad para usar contextos de forma condicional y segura.
 * Permite que componentes accedan a contextos que pueden no estar disponibles
 * dependiendo de qué página estén cargando.
 */

type ContextHook<T> = () => T;
type OptionalContextHook<T> = () => T | null;

/**
 * Convierte un hook de contexto requerido en uno opcional
 * que retorna null si el contexto no está disponible.
 */
export function makeOptional<T>(
  useContextHook: ContextHook<T>
): OptionalContextHook<T> {
  return () => {
    try {
      return useContextHook();
    } catch (error) {
      // Si el contexto no está disponible, retornamos null
      // en lugar de lanzar un error
      if (error instanceof Error && error.message.includes('debe ser usado dentro')) {
        return null;
      }
      throw error;
    }
  };
}

/**
 * Hook para verificar si un contexto específico está disponible
 */
export function useIsContextAvailable<T>(
  useContextHook: ContextHook<T>
): boolean {
  try {
    useContextHook();
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('debe ser usado dentro')) {
      return false;
    }
    return true; // Si es otro tipo de error, asumimos que el contexto está disponible
  }
}
