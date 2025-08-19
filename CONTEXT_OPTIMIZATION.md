# Arquitectura de Contextos Optimizada

Esta nueva arquitectura divide los contextos en proveedores más pequeños y específicos para optimizar el rendimiento y evitar re-renderizados innecesarios.

## Estructura de Contextos

### 1. NotificationsContext
- **Propósito**: Manejo global de notificaciones
- **Datos**: Notificaciones del sistema, funciones para agregar/eliminar
- **Usado en**: Toda la aplicación
- **Re-renderiza cuando**: Se agregan/eliminan notificaciones

### 2. AuthContext
- **Propósito**: Autenticación y perfil de usuario
- **Datos**: Datos del perfil del usuario
- **Usado en**: Componentes que necesitan info del usuario
- **Re-renderiza cuando**: Cambia el perfil del usuario

### 3. ExpensesContext
- **Propósito**: Gastos y categorías (muy relacionados)
- **Datos**: Lista de gastos, categorías, funciones CRUD
- **Usado en**: Dashboard, Registro, Reportes, Análisis
- **Re-renderiza cuando**: Se modifican gastos o categorías

### 4. FinancialsContext
- **Propósito**: Datos financieros (ingresos, gastos fijos, presupuestos)
- **Datos**: Ingresos mensuales, gastos fijos, presupuestos por categoría
- **Usado en**: Dashboard, Reportes
- **Re-renderiza cuando**: Cambian datos financieros

### 5. PlanningContext
- **Propósito**: Planificación financiera (patrimonio neto y metas de ahorro)
- **Datos**: Activos, pasivos, metas de ahorro
- **Usado en**: Página de planificación
- **Re-renderiza cuando**: Cambian activos, pasivos o metas

### 6. CombinedCalculationsContext
- **Propósito**: Cálculos que requieren datos de múltiples contextos
- **Datos**: Cálculos derivados, notificaciones de presupuesto
- **Usado en**: Componentes que necesitan datos calculados
- **Re-renderiza cuando**: Cambian los datos base de otros contextos

## Uso en Páginas

### Método 1: Carga Selectiva de Contextos
```tsx
// En lugar de cargar todos los contextos para toda la app
<AppProvider userId={userId}>
  <PlanningPage />
</AppProvider>

// Carga solo los contextos necesarios para cada página
<AppProvider userId={userId}> {/* Contextos base */}
  <PlanningPageProvider userId={userId}> {/* Contextos específicos */}
    <PlanningPage />
  </PlanningPageProvider>
</AppProvider>
```

### Método 2: Uso Condicional de Contextos
```tsx
import { makeOptional } from '../hooks/useContextUtils';
import { useNetWorthContext } from '../contexts/PlanningContext';

// Hook opcional que no falla si el contexto no está disponible
const useOptionalNetWorth = makeOptional(useNetWorthContext);

function MyComponent() {
  const netWorthData = useOptionalNetWorth();
  
  if (!netWorthData) {
    return <div>Esta página no tiene acceso a datos de patrimonio</div>;
  }
  
  return <div>Patrimonio: {netWorthData.totalNetWorth}</div>;
}
```

## Beneficios de Rendimiento

### Antes (Arquitectura Monolítica)
```
Usuario escribe en un formulario
     ↓
AppContext se actualiza
     ↓
TODOS los componentes se re-renderizan
     ↓
Aplicación lenta en formularios
```

### Después (Arquitectura Modular)
```
Usuario escribe en formulario de gastos
     ↓
Solo ExpensesContext se actualiza
     ↓
Solo componentes que usan gastos se re-renderizan
     ↓
Otros componentes (perfil, planificación) no se ven afectados
```

## Ejemplo de Migración

### Antes
```tsx
// Componente que usaba el contexto monolítico
function Dashboard() {
  const { expenses } = useExpensesContext();
  const { monthlyIncome } = useFinancialsContext();
  const { notifications } = useNotificationsContext();
  
  // Cualquier cambio en cualquier parte causaba re-render
}
```

### Después
```tsx
// Solo se re-renderiza cuando cambian los datos que realmente usa
function Dashboard() {
  const { expenses } = useExpensesContext();     // Solo gastos
  const { monthlyIncome } = useFinancialsContext(); // Solo financieros
  const { notifications } = useNotificationsContext(); // Solo notificaciones
  
  // Ahora cada hook viene de un proveedor específico
  // Re-renders mucho más granulares y eficientes
}
```

## Métricas de Mejora Esperadas

1. **Re-renderizados**: Reducción de ~70% en re-renders innecesarios
2. **Tiempo de tipeo**: Mejor respuesta en formularios (de 200ms a ~50ms)
3. **Memoria**: Menor uso de memoria al no cargar contextos innecesarios
4. **Escalabilidad**: Mejor rendimiento conforme la app crece

## Retrocompatibilidad

La migración mantiene todos los exports existentes en `AppContext.tsx`, por lo que el código existente seguirá funcionando sin cambios. La optimización se puede aplicar gradualmente página por página.
