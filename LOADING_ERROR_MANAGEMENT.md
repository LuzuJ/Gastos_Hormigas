# Manejo de Estados de Carga y Errores

Esta documentación explica cómo implementar el manejo consistente de estados de loading y error en toda la aplicación.

## Arquitectura

### 1. Hook de Utilidad: `useLoadingState`

```typescript
const { 
  loading, 
  error, 
  startLoading, 
  stopLoading, 
  setErrorState, 
  clearError 
} = useLoadingState(true); // true = empieza cargando
```

### 2. Función de Utilidad: `handleAsyncOperation`

```typescript
const result = await handleAsyncOperation(
  () => service.someOperation(data),
  'Mensaje de error personalizado'
);

if (result.success) {
  // Operación exitosa
} else {
  // Manejar error: result.error
}
```

### 3. Componentes de UI

- `LoadingSpinner`: Indicador de carga
- `ErrorMessage`: Mensaje de error con acciones
- `LoadingStateWrapper`: Wrapper que maneja ambos estados

## Implementación en Hooks

### Ejemplo: useCategories

```typescript
export const useCategories = (userId: string | null) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { loading, error, startLoading, stopLoading, setErrorState, clearError } = useLoadingState(true);

  useEffect(() => {
    if (!userId) {
      setCategories([]);
      stopLoading();
      return;
    }

    startLoading();
    clearError();

    const unsubscribe = service.onUpdate(userId, (data) => {
      setCategories(data || []);
      stopLoading();
    });

    return () => unsubscribe();
  }, [userId, startLoading, stopLoading, clearError]);

  const addCategory = useCallback(async (name: string) => {
    if (!userId) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    return await handleAsyncOperation(
      () => service.addCategory(userId, name),
      'Error al agregar la categoría'
    );
  }, [userId]);

  return {
    categories,
    loadingCategories: loading,
    categoriesError: error,
    clearCategoriesError: clearError,
    addCategory,
    // ... otras operaciones
  };
};
```

## Uso en Componentes

### 1. Patrón Básico

```tsx
const MyComponent = () => {
  const { 
    data, 
    loadingData, 
    dataError, 
    clearDataError 
  } = useMyHook();

  if (loadingData) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (dataError) {
    return (
      <ErrorMessage 
        error={dataError} 
        onDismiss={clearDataError}
        onRetry={() => {
          clearDataError();
          // Lógica de reintento
        }}
      />
    );
  }

  return <div>{/* Contenido normal */}</div>;
};
```

### 2. Patrón con LoadingStateWrapper

```tsx
const MyComponent = () => {
  const { 
    data, 
    loadingData, 
    dataError, 
    clearDataError 
  } = useMyHook();

  return (
    <LoadingStateWrapper
      loading={loadingData}
      error={dataError}
      onDismissError={clearDataError}
      loadingMessage="Cargando datos..."
    >
      <div>{/* Contenido que se muestra cuando todo está bien */}</div>
    </LoadingStateWrapper>
  );
};
```

### 3. Patrón para Múltiples Estados

```tsx
const DashboardPage = () => {
  const { categories, loadingCategories, categoriesError } = useCategoriesContext();
  const { expenses, loadingExpenses, expensesError } = useExpensesContext();
  const { financials, loadingFinancials, financialsError } = useFinancialsContext();

  // Estados críticos que bloquean toda la página
  const isLoadingCritical = loadingCategories || loadingExpenses;
  const criticalError = categoriesError || expensesError;

  return (
    <div>
      <LoadingStateWrapper
        loading={isLoadingCritical}
        error={criticalError}
        loadingMessage="Cargando datos principales..."
      >
        <MainContent />
      </LoadingStateWrapper>

      {/* Datos no críticos con loading independiente */}
      <LoadingStateWrapper
        loading={loadingFinancials}
        error={financialsError}
        loadingMessage="Cargando datos financieros..."
      >
        <FinancialSummary />
      </LoadingStateWrapper>
    </div>
  );
};
```

## Manejo de Errores en Operaciones

### 1. En Formularios

```tsx
const MyForm = () => {
  const { addItem } = useMyContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await addItem(data);
    
    if (result.success) {
      // Éxito: limpiar formulario, mostrar toast, etc.
      resetForm();
      toast.success('Elemento agregado exitosamente');
    } else {
      // Error: mostrar mensaje
      setSubmitError(result.error || 'Error desconocido');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      
      {submitError && (
        <ErrorMessage 
          error={submitError} 
          onDismiss={() => setSubmitError(null)} 
        />
      )}
      
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
};
```

### 2. Con Notificaciones Toast

```tsx
const handleOperation = async () => {
  const result = await myOperation();
  
  if (result.success) {
    toast.success('Operación completada');
  } else {
    toast.error(result.error || 'Error en la operación');
  }
};
```

## Estados de Loading Específicos

### Por Tamaño de Componente

```tsx
// Para componentes pequeños
<LoadingSpinner size="small" message="Guardando..." />

// Para secciones medianas
<LoadingSpinner size="medium" message="Cargando datos..." />

// Para páginas completas
<LoadingSpinner size="large" message="Inicializando aplicación..." />
```

### Por Tipo de Operación

```tsx
// Carga inicial
<LoadingSpinner message="Cargando datos..." />

// Guardando cambios
<LoadingSpinner message="Guardando cambios..." />

// Procesando
<LoadingSpinner message="Procesando información..." />

// Sincronizando
<LoadingSpinner message="Sincronizando con el servidor..." />
```

## Mejores Prácticas

### 1. Nombres Consistentes

```typescript
// ✅ Bien - nombres descriptivos y consistentes
loadingExpenses, expensesError, clearExpensesError
loadingCategories, categoriesError, clearCategoriesError
loadingFinancials, financialsError, clearFinancialsError

// ❌ Mal - nombres inconsistentes
loading, error, clearError (muy genérico)
isLoading, hasError, resetError (diferentes patrones)
```

### 2. Manejo de Dependencias

```typescript
// ✅ Bien - dependencias específicas
useEffect(() => {
  // lógica
}, [userId, startLoading, stopLoading, clearError]);

// ❌ Mal - dependencias genéricas que causan re-renders
useEffect(() => {
  // lógica
}, [hookFunctions]); // hookFunctions cambia en cada render
```

### 3. Estados de Error Granulares

```typescript
// ✅ Bien - errores específicos
return {
  // ... data
  loadingExpenses,
  expensesError,
  loadingCategories, 
  categoriesError
};

// ❌ Mal - error genérico
return {
  // ... data
  loading: loadingExpenses || loadingCategories,
  error: expensesError || categoriesError // Perdemos especificidad
};
```

### 4. Mensajes de Error Amigables

```typescript
// ✅ Bien - mensajes específicos y amigables
'Error al cargar las categorías'
'No se pudo guardar el gasto. Inténtalo de nuevo.'
'Error de conexión. Verifica tu internet.'

// ❌ Mal - mensajes técnicos
'Network Error'
'Firestore: PERMISSION_DENIED'
'TypeError: Cannot read property...'
```
