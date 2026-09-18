# Tests con Referencias a Firebase - DESHABILITADOS

## ⚠️ Estado: DEPRECATED

Estos tests están temporalmente deshabilitados porque contienen referencias a Firebase, que ya fue eliminado del proyecto.

## Archivos Afectados

### Tests de Servicios
- `categoryService.test.ts` - Tests de servicio de categorías
- `fixedExpenseService.test.ts` - Tests de gastos fijos
- `financialsService.test.ts` - Tests de finanzas
- `savingsGoalService.test.ts` - Tests de metas de ahorro

### Tests de Componentes
- `EditExpenseModal.test.tsx` - Modal de edición de gastos
- `ExpenseList.test.tsx` - Lista de gastos

### Tests de Hooks
- `useCombinedCalculations.test.ts` - Cálculos combinados

### Tests de Integración
- `auth.integration.test.tsx` - Autenticación Firebase
- `financials.integration.test.tsx` - Finanzas Firebase
- `fixedExpenses.integration.test.tsx` - Gastos fijos Firebase
- `savingsGoals.integration.test.tsx` - Metas de ahorro Firebase

## Motivo

Estos tests usan mocks de Firebase Firestore:
```typescript
import { Timestamp } from 'firebase/firestore';
vi.mock('firebase/firestore', () => { ... })
```

## Solución

Hay 2 opciones:

### Opción 1: Reescribir con Supabase (Recomendado)
Migrar los tests a usar mocks de Supabase en lugar de Firebase.

Tiempo estimado: 8-12 horas

Ver ejemplos en:
- `src/__tests__/integration/transactions.test.ts` ✅
- `src/__tests__/integration/asset.repository.test.ts` ✅
- `src/__tests__/integration/expense.repository.test.ts` ✅

### Opción 2: Eliminar Permanentemente
Si el código que prueban ya no existe o fue migrado a nuevos servicios.

## Build de Producción

Estos tests no afectan el build de producción porque:
1. Los archivos de tests no se incluyen en el bundle
2. Los servicios que usan ya fueron migrados a Supabase
3. Los componentes funcionan con los nuevos repositorios

## Próximos Pasos

- [ ] Auditar qué tests son aún relevantes
- [ ] Reescribir tests críticos con mocks de Supabase
- [ ] Eliminar tests de código que ya no existe
- [ ] Actualizar coverage reports

## Referencias

- [CRITICAL_ANALYSIS.md](../../CRITICAL_ANALYSIS.md) - Análisis completo
- [CRITICAL_SOLUTIONS.md](../../CRITICAL_SOLUTIONS.md) - Soluciones implementadas
- [Repository Pattern Tests](../__tests__/integration/) - Tests actualizados
