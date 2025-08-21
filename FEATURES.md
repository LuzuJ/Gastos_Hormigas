# 📋 Documentación de Funcionalidades - Gastos Hormigas

## 🏠 **Dashboard Financiero**

### **Resumen General**
El Dashboard es el centro de control de la aplicación, proporcionando una vista panorámica de la situación financiera del usuario.

#### **Componentes Principales**

| Componente | Descripción | Datos Mostrados |
|------------|-------------|-----------------|
| **Balance General** | Resumen de ingresos vs gastos | • Ingresos del mes<br>• Gastos del mes<br>• Balance disponible<br>• Tendencia vs mes anterior |
| **Gráfico de Gastos** | Distribución por categorías | • Top 5 categorías<br>• Porcentajes relativos<br>• Comparación temporal |
| **Presupuesto Mensual** | Estado de presupuestos | • Progreso por categoría<br>• Alertas de exceso<br>• Recomendaciones |
| **Metas de Ahorro** | Progreso hacia objetivos | • Porcentaje completado<br>• Tiempo restante<br>• Proyección de cumplimiento |

#### **Funcionalidades Interactivas**
- **Filtros temporales**: Hoy, semana, mes, año, personalizado
- **Zoom en gráficos**: Click para detalles por categoría
- **Acciones rápidas**: Registrar gasto, crear meta, ajustar presupuesto
- **Notificaciones**: Alertas de presupuesto, recordatorios, logros

---

## 💸 **Gestión de Gastos**

### **Registro de Gastos**

#### **Formulario Principal**
```typescript
interface ExpenseForm {
  amount: number;           // Monto del gasto
  description: string;      // Descripción detallada
  categoryId: string;       // Categoría seleccionada
  date?: Date;             // Fecha (default: hoy)
  isRecurring?: boolean;   // Gasto recurrente
  tags?: string[];         // Etiquetas opcionales
  paymentSourceId?: string; // Fuente de pago
}
```

#### **Características del Formulario**
- **Validación en tiempo real**: Campos obligatorios, formatos, límites
- **Autocompletado inteligente**: Sugerencias basadas en historial
- **Categorización automática**: IA sugiere categoría por descripción
- **Calculadora integrada**: Para cálculos rápidos
- **Modo rápido**: Registro con 3 campos mínimos

#### **Categorías Personalizables**

| Categoría Default | Icono | Color Sugerido | Presupuesto Típico |
|-------------------|--------|----------------|-------------------|
| 🛒 **Supermercado** | Shopping Cart | Verde | $3,000 |
| 🍔 **Comida** | Utensils | Naranja | $1,500 |
| ⛽ **Transporte** | Car | Azul | $1,000 |
| 🏠 **Hogar** | Home | Púrpura | $2,000 |
| 🎉 **Entretenimiento** | Film | Rosa | $800 |
| 👕 **Ropa** | Shirt | Cian | $500 |
| 💊 **Salud** | Heart | Rojo | $600 |
| 📚 **Educación** | Book | Índigo | $300 |

### **Fuentes de Pago**

#### **Tipos de Fuentes de Pago Soportadas**
```typescript
type PaymentSourceType = 
  | 'cash'           // Efectivo
  | 'debit_card'     // Tarjeta de débito
  | 'credit_card'    // Tarjeta de crédito
  | 'bank_transfer'  // Transferencia bancaria
  | 'digital_wallet' // Billetera digital
  | 'other';         // Otros métodos
```

#### **Gestión de Fuentes de Pago**
- **Creación automática**: Fuentes por defecto al registrarse
- **Personalización**: Nombres, colores e íconos customizables
- **Seguimiento de saldos**: Para cuentas y tarjetas
- **Limpieza de duplicados**: Sistema automático de detección y eliminación

### **Filtros Avanzados**

#### **Sistema de Filtrado Dinámico**
```typescript
interface FilterOptions {
  period: FilterPeriod;     // Período de tiempo
  categories: string[];     // Categorías específicas
  amountRange: {           // Rango de montos
    min?: number;
    max?: number;
  };
  searchTerm: string;      // Búsqueda en descripción
  tags: string[];          // Filtro por etiquetas
  paymentSources: string[]; // Filtro por fuente de pago
}
```

#### **Períodos de Filtrado**
- **Preestablecidos**: Hoy, esta semana, este mes, este año
- **Dinámicos**: Solo meses/años con gastos registrados
- **Personalizado**: Selección libre de rango de fechas
- **Contadores informativos**: "Enero 2024 (15 gastos)"

---

## 🎯 **Sistema de Presupuestos**

### **Configuración de Presupuestos**

#### **Tipos de Presupuesto**
```typescript
interface Budget {
  id: string;
  categoryId: string;        // Categoría asociada
  amount: number;           // Monto presupuestado
  period: 'monthly' | 'weekly' | 'daily';
  alertThresholds: {
    warning: number;        // % para alerta amarilla (ej: 80%)
    danger: number;         // % para alerta roja (ej: 95%)
  };
  rollover: boolean;        // Permitir acumular sobrantes
  isActive: boolean;
  autoAdjust: boolean;      // Ajuste automático basado en historial
}
```

#### **Alertas Inteligentes**
- **Alerta temprana**: Al 70% del presupuesto
- **Alerta crítica**: Al 90% del presupuesto
- **Notificación de exceso**: Cuando se supera el 100%
- **Sugerencias automáticas**: Recomendaciones para ajustar

#### **Visualización del Progreso**
- **Barras de progreso**: Con estados de color (verde → amarillo → rojo)
- **Indicadores numéricos**: Monto gastado / presupuestado
- **Tendencias**: Comparación con meses anteriores
- **Proyecciones**: Estimación de gasto al fin de mes

---

## 🏦 **Planificación Financiera**

### **Gestión de Patrimonio Neto**

#### **Activos y Pasivos**
```typescript
interface NetWorthItem {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  category: AssetCategory | LiabilityCategory;
  currentValue: number;
  lastUpdated: Date;
  isLiquid: boolean;        // Para activos
  interestRate?: number;    // Para pasivos
  maturityDate?: Date;      // Para inversiones/deudas
}
```

#### **Categorías de Activos**
- **Efectivo y equivalentes**: Dinero en cuenta, ahorros
- **Inversiones**: Acciones, bonos, fondos
- **Bienes raíces**: Propiedades, terrenos
- **Vehículos**: Automóviles, motocicletas
- **Otros activos**: Joyas, arte, colecciones

#### **Categorías de Pasivos**
- **Tarjetas de crédito**: Saldos pendientes
- **Préstamos personales**: Deudas no garantizadas
- **Hipoteca**: Préstamos inmobiliarios
- **Préstamos de vehículos**: Financiamiento automotriz
- **Préstamos estudiantiles**: Deudas educativas

### **Metas de Ahorro**

#### **Configuración de Metas**
```typescript
interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;     // Monto objetivo
  currentAmount: number;    // Monto actual
  targetDate: Date;         // Fecha objetivo
  priority: 'high' | 'medium' | 'low';
  category: GoalCategory;
  autoTransfer: {          // Transferencia automática
    enabled: boolean;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}
```

#### **Tipos de Metas**
- **Fondo de emergencia**: 3-6 meses de gastos
- **Vacaciones**: Viajes y recreación
- **Vivienda**: Enganche o compra de casa
- **Vehículo**: Compra de automóvil
- **Educación**: Estudios propios o familiares
- **Retiro**: Planes de jubilación

### **Planificador de Flujo de Efectivo**

#### **Ingresos Recurrentes**
```typescript
interface RecurringIncome {
  id: string;
  name: string;           // Ej: "Salario", "Freelance"
  amount: number;
  frequency: Frequency;
  nextDate: Date;
  isActive: boolean;
  source: IncomeSource;
}
```

#### **Gastos Fijos**
```typescript
interface FixedExpense {
  id: string;
  name: string;           // Ej: "Renta", "Internet"
  amount: number;
  frequency: Frequency;
  nextDate: Date;
  categoryId: string;
  isEssential: boolean;   // Gasto esencial vs opcional
  canNegotiate: boolean;  // Puede renegociarse
}
```

---

## 💳 **Estrategias de Pago de Deudas**

### **Método Bola de Nieve (Snowball)**

#### **Algoritmo de Priorización**
1. **Ordenar deudas**: Por saldo (menor a mayor)
2. **Pagar mínimos**: En todas las deudas
3. **Pago extra**: A la deuda más pequeña
4. **Eliminar y avanzar**: Al terminar una, ir a la siguiente

#### **Ventajas**
- **Motivación rápida**: Eliminar deudas pequeñas genera momentum
- **Simplicidad**: Fácil de entender y seguir
- **Celebración de logros**: Victorias tempranas mantienen motivación

### **Método Avalancha (Avalanche)**

#### **Algoritmo de Optimización**
1. **Ordenar deudas**: Por tasa de interés (mayor a menor)
2. **Pagar mínimos**: En todas las deudas
3. **Pago extra**: A la deuda con mayor interés
4. **Optimizar ahorro**: Minimizar intereses totales

#### **Ventajas**
- **Ahorro en intereses**: Minimiza el costo total
- **Eficiencia matemática**: Estrategia óptima financieramente
- **Tiempo reducido**: Elimina deudas más rápidamente

### **Calculadora de Estrategias**

#### **Comparación de Métodos**
```typescript
interface StrategyComparison {
  snowball: {
    totalInterest: number;      // Intereses totales a pagar
    payoffTime: number;         // Meses para liberarse
    firstDebtFree: number;      // Meses hasta primera deuda eliminada
    motivationScore: number;    // Score de motivación (1-10)
  };
  avalanche: {
    totalInterest: number;
    payoffTime: number;
    firstDebtFree: number;
    savingsVsSnowball: number;  // Ahorro vs método bola de nieve
  };
}
```

---

## 📊 **Reportes y Análisis**

### **Dashboard de Reportes**

#### **Métricas Principales**
- **Patrimonio neto**: Valor actual y tendencia
- **Flujo de efectivo**: Ingresos vs gastos mensuales
- **Ratio deuda/ingresos**: Porcentaje de deuda
- **Tasa de ahorro**: Porcentaje de ingresos ahorrados
- **Crecimiento de gastos**: Variación mensual

#### **Gráficos Interactivos**
- **Área apilada**: Ingresos vs gastos por mes
- **Dona**: Distribución de gastos por categoría
- **Línea temporal**: Tendencias patrimoniales
- **Barras comparativas**: Gastos mes vs mes
- **Waterfall**: Flujo de efectivo detallado

### **Reportes Predefinidos**

#### **Reporte Mensual**
- **Resumen ejecutivo**: Puntos clave del mes
- **Análisis de variaciones**: Cambios vs mes anterior
- **Top categorías**: Gastos más significativos
- **Recomendaciones**: Sugerencias basadas en patrones

#### **Reporte Anual**
- **Resumen del año**: Logros y desafíos
- **Evolución patrimonial**: Crecimiento anual
- **Análisis de metas**: Cumplimiento de objetivos
- **Proyecciones**: Estimaciones para el próximo año

---

## 🔐 **Sistema de Autenticación**

### **Métodos de Autenticación**

#### **Registro/Login por Email**
- **Validación de email**: Verificación obligatoria
- **Contraseñas seguras**: Mínimo 8 caracteres, complejidad
- **Recuperación de contraseña**: Reset por email
- **Sesiones persistentes**: Recordar usuario

#### **Autenticación Social**
- **Google OAuth**: Integración con cuentas de Google
- **Login rápido**: Sin necesidad de crear nueva contraseña
- **Sincronización**: Datos vinculados a cuenta social

#### **Modo Invitado**
- **Prueba sin registro**: Funcionalidad completa temporal
- **Almacenamiento local**: Datos solo en el dispositivo
- **Limitaciones**: Sin sincronización ni backup
- **Conversión fácil**: Upgrade a cuenta completa

### **Seguridad de Datos**

#### **Cifrado y Protección**
- **Transmisión**: HTTPS/TLS para todas las comunicaciones
- **Almacenamiento**: Cifrado en Firebase Firestore
- **Tokens**: JWT con expiración automática
- **Sesiones**: Invalidación tras inactividad

#### **Privacidad**
- **Datos mínimos**: Solo información necesaria
- **Control del usuario**: Exportación y eliminación
- **Transparencia**: Políticas claras de privacidad
- **No comercialización**: Datos nunca vendidos a terceros

---

## 🎨 **Experiencia de Usuario (UX)**

### **Sistema de Theming**

#### **Temas Disponibles**
- **Tema claro**: Colores brillantes para uso diurno
- **Tema oscuro**: Colores suaves para uso nocturno
- **Alto contraste**: Para mejor accesibilidad
- **Personalizado**: Colores de acento configurables

#### **Responsive Design**
- **Mobile first**: Optimizado para dispositivos móviles
- **Tablet friendly**: Aprovecha espacio adicional
- **Desktop enhanced**: Funcionalidades extendidas
- **Touch optimized**: Botones de tamaño adecuado

### **Gamificación**

#### **Sistema de Logros**
- **Primer registro**: Registra tu primer gasto
- **Ahorrador novato**: Cumple tu primera meta
- **Presupuestador**: Mantén presupuesto 3 meses
- **Libre de deudas**: Elimina todas tus deudas
- **Racha de oro**: 30 días consecutivos registrando

#### **Progreso Visual**
- **Barras de progreso**: Para metas y presupuestos
- **Medallas y badges**: Reconocimiento de logros
- **Estadísticas**: Días activos, gastos registrados
- **Niveles**: Sistema de progresión del usuario

### **Accesibilidad**

#### **Cumplimiento WCAG 2.1**
- **Contraste**: Cumple estándares AA
- **Navegación por teclado**: Todos los elementos accesibles
- **Lectores de pantalla**: Etiquetas ARIA completas
- **Texto alternativo**: Para todos los elementos visuales

---

## 🔄 **Integración y Sincronización**

### **Sincronización en Tiempo Real**
- **Firebase Firestore**: Base de datos en tiempo real
- **Actualizaciones instantáneas**: Cambios reflejados inmediatamente
- **Resolución de conflictos**: Manejo automático de conflictos
- **Indicadores de estado**: Online/offline, sincronizando

### **Manejo Offline**
- **Cache local**: Almacenamiento en IndexedDB
- **Queue de sincronización**: Operaciones pendientes
- **Modo offline**: Funcionalidad limitada sin conexión
- **Resincronización**: Automática al recuperar conexión

### **Exportación de Datos**

#### **Formatos Soportados**
- **CSV**: Para análisis en Excel
- **PDF**: Reportes formales con gráficos
- **JSON**: Backup completo de datos

#### **Opciones de Exportación**
- **Rango temporal**: Fechas personalizables
- **Filtros**: Por categorías, montos, etc.
- **Campos**: Selección de datos a incluir
- **Programación**: Exportación automática periódica

---

## 🛠️ **Funcionalidades Avanzadas**

### **Detección de Duplicados**
- **Algoritmo inteligente**: Detecta gastos similares
- **Confirmación de usuario**: No elimina automáticamente
- **Criterios configurables**: Personalizar detección
- **Limpieza masiva**: Herramientas de limpieza

### **Automatización Financiera**
- **Categorización automática**: IA aprende patrones
- **Recordatorios inteligentes**: Gastos fijos y metas
- **Proyecciones**: Estimaciones basadas en historial
- **Recomendaciones**: Sugerencias personalizadas

### **Análisis Predictivo**
- **Tendencias**: Identificación de patrones
- **Alertas tempranas**: Riesgos financieros
- **Oportunidades**: Identificación de ahorros
- **Proyecciones**: Escenarios futuros

---

*Esta documentación se mantiene actualizada con cada release y refleja las funcionalidades actuales de la aplicación.*
