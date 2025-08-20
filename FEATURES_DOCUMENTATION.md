# 📋 Features Documentation - Gastos Hormigas

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
  location?: string;       // Ubicación GPS
  receipt?: File;          // Foto del recibo
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
  dateRange: {            // Rango personalizado
    startDate: Date;
    endDate: Date;
  };
}

type FilterPeriod = 
  | 'today'           // Gastos de hoy
  | 'thisWeek'        // Esta semana
  | 'thisMonth'       // Este mes
  | 'lastMonth'       // Mes anterior
  | 'last3Months'     // Últimos 3 meses
  | 'thisYear'        // Este año
  | 'specificMonth'   // Mes específico (dropdown)
  | 'specificYear'    // Año específico (dropdown)
  | 'custom';         // Rango personalizado
```

#### **Filtros Inteligentes por Período**

- **Dropdowns dinámicos**: Solo meses/años con gastos registrados
- **Contadores informativos**: "Enero 2024 (15 gastos)"
- **Ordenamiento inteligente**: Períodos más recientes primero
- **Estados vacíos**: Mensajes claros cuando no hay datos

#### **Búsqueda Avanzada**

- **Búsqueda fuzzy**: Encuentra gastos con errores de tipeo
- **Autocompletado**: Sugerencias mientras escribes
- **Búsqueda por tags**: #comida #trabajo #regalo
- **Filtros combinados**: Múltiples criterios simultáneos

### **Exportación de Datos**

#### **Formatos Soportados**

| Formato | Casos de Uso | Datos Incluidos |
|---------|--------------|-----------------|
| **CSV** | Análisis en Excel | Todos los campos + categorías |
| **PDF** | Reportes formales | Resumen + gráficos + detalle |
| **JSON** | Backup/Migración | Datos completos + metadatos |

#### **Opciones de Exportación**

- **Rango temporal**: Selección flexible de fechas
- **Categorías específicas**: Filtrar antes de exportar
- **Campos personalizados**: Elegir qué columnas incluir
- **Formato de moneda**: Pesos, dólares, etc.

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

```css
/* Barra de progreso con estados de color */
.progress-bar {
  /* Verde: 0-70% */
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  
  /* Amarillo: 70-90% */
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  
  /* Rojo: 90%+ */
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}
```

### **Análisis de Presupuesto**

#### **Métricas Clave**

- **Adherencia al presupuesto**: % de cumplimiento mensual
- **Categorías problemáticas**: Donde más se excede
- **Tendencias**: Mejora/empeoramiento mes a mes
- **Proyecciones**: Estimación de gasto al fin de mes

#### **Recomendaciones Automáticas**

- **Ajuste de presupuestos**: Basado en patrones históricos
- **Redistribución**: Mover dinero entre categorías
- **Metas realistas**: Sugerir presupuestos alcanzables

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

type AssetCategory = 
  | 'cash'              // Efectivo
  | 'checking'          // Cuenta corriente
  | 'savings'           // Cuenta de ahorros
  | 'investments'       // Inversiones
  | 'retirement'        // Fondo de retiro
  | 'property'          // Bienes raíces
  | 'vehicles'          // Vehículos
  | 'other';            // Otros activos

type LiabilityCategory = 
  | 'credit_cards'      // Tarjetas de crédito
  | 'personal_loans'    // Préstamos personales
  | 'mortgage'          // Hipoteca
  | 'auto_loans'        // Préstamos de auto
  | 'student_loans'     // Préstamos estudiantiles
  | 'other_debts';      // Otras deudas
```

#### **Seguimiento Temporal**

- **Historial mensual**: Evolución del patrimonio neto
- **Gráficos de tendencia**: Visualización del crecimiento
- **Metas de patrimonio**: Objetivos a largo plazo
- **Proyecciones**: Estimaciones de crecimiento

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
    sourceAccount: string;
  };
  milestones: Milestone[]; // Hitos intermedios
}

type GoalCategory = 
  | 'emergency_fund'    // Fondo de emergencia
  | 'vacation'          // Vacaciones
  | 'home'              // Vivienda
  | 'car'               // Vehículo
  | 'education'         // Educación
  | 'retirement'        // Retiro
  | 'other';            // Otros objetivos
```

#### **Visualización y Motivación**

- **Barras de progreso animadas**: Con efectos visuales
- **Logros desbloqueables**: Gamificación del ahorro
- **Recordatorios personalizados**: Notificaciones motivacionales
- **Proyecciones de cumplimiento**: "A este ritmo, lo lograrás en X meses"

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

type Frequency = 
  | 'weekly'            // Semanal
  | 'bi_weekly'         // Quincenal
  | 'monthly'           // Mensual
  | 'quarterly'         // Trimestral
  | 'annually';         // Anual

type IncomeSource = 
  | 'salary'            // Salario
  | 'freelance'         // Trabajo independiente
  | 'business'          // Negocio
  | 'investments'       // Inversiones
  | 'rental'            // Rentas
  | 'other';            // Otros
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
  notes?: string;
}
```

#### **Proyecciones Financieras**

- **Flujo de efectivo mensual**: Ingresos vs gastos proyectados
- **Alertas de déficit**: Cuando los gastos excedan ingresos
- **Oportunidades de ahorro**: Identificar gastos optimizables
- **Escenarios "qué pasaría si"**: Simulaciones de cambios

---

## 💳 **Estrategias de Pago de Deudas**

### **Método Bola de Nieve (Snowball)**

#### **Algoritmo de Priorización**

```typescript
function calculateSnowballStrategy(debts: Debt[], monthlyPayment: number) {
  // 1. Ordenar deudas por saldo (menor a mayor)
  const sortedDebts = debts.sort((a, b) => a.balance - b.balance);
  
  // 2. Pagar mínimos en todas las deudas
  const minimumPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  // 3. Asignar pago extra a la deuda más pequeña
  const extraPayment = monthlyPayment - minimumPayments;
  
  return generatePaymentPlan(sortedDebts, extraPayment);
}
```

#### **Ventajas Psicológicas**

- **Motivación rápida**: Eliminar deudas pequeñas genera momentum
- **Simplicidad**: Fácil de entender y seguir
- **Celebración de logros**: Victorias tempranas mantienen motivación

### **Método Avalancha (Avalanche)**

#### **Algoritmo de Optimización**

```typescript
function calculateAvalancheStrategy(debts: Debt[], monthlyPayment: number) {
  // 1. Ordenar deudas por tasa de interés (mayor a menor)
  const sortedDebts = debts.sort((a, b) => b.interestRate - a.interestRate);
  
  // 2. Pagar mínimos en todas las deudas
  const minimumPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  // 3. Asignar pago extra a la deuda con mayor interés
  const extraPayment = monthlyPayment - minimumPayments;
  
  return generatePaymentPlan(sortedDebts, extraPayment);
}
```

#### **Ventajas Financieras**

- **Ahorro en intereses**: Minimiza el costo total de las deudas
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
  recommendation: 'snowball' | 'avalanche' | 'hybrid';
}
```

#### **Visualización del Progreso**

- **Gráfico de cascada**: Visualización de eliminación de deudas
- **Barras de progreso**: Por cada deuda individual
- **Calendario de liberación**: Fechas proyectadas de eliminación
- **Ahorro acumulado**: Dinero ahorrado en intereses

### **Funcionalidades Avanzadas**

#### **Pagos Extra y Bonificaciones**

- **Simulador de pagos extra**: "¿Qué pasa si pago $500 extra este mes?"
- **Aplicación de bonos**: Usar aguinaldos o bonificaciones para acelerar
- **Refinanciamiento**: Evaluar opciones de consolidación

#### **Seguimiento Motivacional**

- **Contador de días libres de deuda**: Countdown hasta libertad financiera
- **Celebración de hitos**: Notificaciones al eliminar cada deuda
- **Progreso visual**: Termómetro de progreso general
- **Impacto del progreso**: "Has ahorrado $X en intereses este mes"

---

## 📊 **Reportes y Análisis**

### **Dashboard de Reportes**

#### **Métricas Principales**

```typescript
interface FinancialMetrics {
  netWorth: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    monthlyChange: number;
    yearlyChange: number;
  };
  cashFlow: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyNet: number;
    emergencyMonths: number;    // Meses de gastos cubiertos
  };
  debtToIncome: number;         // Ratio deuda/ingresos
  savingsRate: number;          // % de ingresos ahorrados
  expenseGrowth: number;        // Crecimiento de gastos (%)
}
```

#### **Gráficos Interactivos**

| Tipo de Gráfico | Datos Mostrados | Interactividad |
|------------------|-----------------|----------------|
| **Área Apilada** | Ingresos vs gastos por mes | Zoom, filtros por categoría |
| **Dona** | Distribución de gastos | Click para detalles |
| **Línea Temporal** | Tendencias patrimoniales | Marcadores de eventos |
| **Barras Comparativas** | Gastos mes vs mes | Tooltips con variaciones |
| **Waterfall** | Flujo de efectivo | Drill-down por período |

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

### **Análisis Predictivo**

#### **Proyecciones Automáticas**

```typescript
interface Projections {
  nextMonthExpenses: {
    predicted: number;
    confidence: number;        // % de confianza en la predicción
    factors: string[];         // Factores considerados
  };
  yearEndNetWorth: {
    conservative: number;      // Escenario conservador
    realistic: number;         // Escenario realista
    optimistic: number;        // Escenario optimista
  };
  debtFreeDate: Date;         // Fecha proyectada libre de deudas
  goalAchievement: {          // Probabilidad de lograr metas
    [goalId: string]: number;
  };
}
```

#### **Alertas Inteligentes**

- **Gastos inusuales**: Detecta patrones atípicos
- **Oportunidades de ahorro**: Identifica categorías optimizables
- **Riesgos financieros**: Alerta sobre tendencias preocupantes
- **Recomendaciones personalizadas**: Sugerencias basadas en comportamiento

---

## 🔐 **Sistema de Autenticación**

### **Métodos de Autenticación**

#### **Registro/Login por Email**

```typescript
interface EmailAuthFlow {
  registration: {
    email: string;
    password: string;         // Mínimo 8 caracteres
    confirmPassword: string;
    acceptTerms: boolean;
    marketing: boolean;       // Opcional
  };
  verification: {
    emailVerification: boolean; // Verificación por email
    resendCooldown: number;    // Cooldown para reenvío
  };
  passwordReset: {
    resetEmail: string;
    resetToken: string;
    expirationTime: number;    // 1 hora
  };
}
```

#### **Autenticación Social**

- **Google OAuth**: Integración con cuentas de Google
- **Apple Sign-In**: Para usuarios de iOS/macOS
- **Autenticación federada**: Usando proveedores de identidad

#### **Modo Invitado**

```typescript
interface GuestMode {
  limitations: {
    dataStorage: 'localStorage'; // Solo almacenamiento local
    syncEnabled: false;          // Sin sincronización
    exportFormats: ['CSV'];      // Exportación limitada
    maxExpenses: 100;           // Límite de gastos
  };
  conversion: {
    upgradePrompts: boolean;     // Prompts para registrarse
    dataTransfer: boolean;       // Transferir datos al registrarse
  };
}
```

### **Seguridad de Datos**

#### **Cifrado y Protección**

- **Transmisión**: HTTPS/TLS 1.3 para todas las comunicaciones
- **Almacenamiento**: Cifrado AES-256 en Firebase
- **Tokens**: JWT con expiración automática
- **Sesiones**: Invalidación automática tras inactividad

#### **Privacidad**

- **Minimización de datos**: Solo se recopilan datos necesarios
- **Anonimización**: Datos analíticos agregados y anonimizados
- **Control del usuario**: Exportación y eliminación de datos
- **Transparencia**: Políticas claras de privacidad

---

## 🎨 **Experiencia de Usuario (UX)**

### **Sistema de Theming**

#### **Temas Disponibles**

```css
/* Tema Claro */
:root[data-theme="light"] {
  --primary: #3b82f6;
  --background: #ffffff;
  --surface: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}

/* Tema Oscuro */
:root[data-theme="dark"] {
  --primary: #60a5fa;
  --background: #0f172a;
  --surface: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
}

/* Tema Alto Contraste */
:root[data-theme="high-contrast"] {
  --primary: #000000;
  --background: #ffffff;
  --surface: #f0f0f0;
  --text-primary: #000000;
  --text-secondary: #333333;
}
```

#### **Personalización**

- **Colores de acento**: Paleta personalizable
- **Tamaños de fuente**: Pequeño, normal, grande
- **Densidad de información**: Compacto, cómodo, espacioso
- **Animaciones**: Control de velocidad o desactivación

### **Responsive Design**

#### **Breakpoints del Sistema**

```css
/* Mobile First Approach */
.container { /* Base: 320px+ */ }

@media (min-width: 480px) { /* Mobile Large */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large Desktop */ }
@media (min-width: 1536px) { /* Extra Large */ }
```

#### **Adaptaciones por Dispositivo**

| Dispositivo | Navegación | Interacciones | Funcionalidades |
|-------------|------------|---------------|-----------------|
| **Móvil** | Tab bar inferior | Touch gestures | Registro rápido, notificaciones push |
| **Tablet** | Sidebar colapsible | Touch + keyboard | Vista split, arrastrar y soltar |
| **Desktop** | Sidebar fijo | Mouse + keyboard | Atajos de teclado, múltiples ventanas |

### **Gamificación**

#### **Sistema de Logros**

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: Requirement;
  reward: Reward;
  unlocked: boolean;
  unlockedAt?: Date;
}

type AchievementCategory = 
  | 'saving'      // Relacionados con ahorro
  | 'budgeting'   // Relacionados con presupuestos
  | 'debt'        // Relacionados con deudas
  | 'consistency' // Relacionados con constancia
  | 'milestones'; // Hitos importantes

interface Requirement {
  type: 'expense_count' | 'savings_goal' | 'budget_adherence' | 'debt_payment';
  value: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
```

#### **Ejemplos de Logros**

- 🎯 **"Primer Registro"**: Registra tu primer gasto
- 💰 **"Ahorrador Novato"**: Cumple tu primera meta de ahorro
- 📊 **"Presupuestador"**: Mantén el presupuesto por 3 meses
- 🎉 **"Libre de Deudas"**: Elimina todas tus deudas
- 🔥 **"Racha de Oro"**: 30 días consecutivos registrando gastos

### **Accesibilidad**

#### **Cumplimiento WCAG 2.1**

- **Nivel AA**: Contraste de colores, navegación por teclado
- **Lectores de pantalla**: Etiquetas ARIA, estructura semántica
- **Navegación**: Focus visible, orden lógico de tab
- **Multimedia**: Alternativas de texto, controles de reproducción

#### **Inclusión**

- **Reducción de movimiento**: Respeta prefer-reduced-motion
- **Tamaños de toque**: Mínimo 44px para elementos interactivos
- **Legibilidad**: Fuentes claras, espaciado adecuado
- **Internacionalización**: Soporte para múltiples idiomas

---

## 🔄 **Integración y APIs**

### **Sincronización de Datos**

#### **Firebase Real-time**

```typescript
// Sincronización automática
const expensesRef = collection(db, 'expenses');
const unsubscribe = onSnapshot(
  query(expensesRef, where('userId', '==', currentUser.uid)),
  (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateExpensesState(expenses);
  }
);
```

#### **Manejo Offline**

- **Cache local**: Almacenamiento en IndexedDB
- **Queue de sincronización**: Operaciones pendientes
- **Resolución de conflictos**: Estrategias de merge
- **Indicadores de estado**: Online/offline, sincronizando

### **APIs Futuras**

#### **Integración Bancaria** (Roadmap)

```typescript
interface BankIntegration {
  provider: 'Plaid' | 'Yodlee' | 'Local Banks';
  accounts: BankAccount[];
  autoSync: boolean;
  categorization: 'automatic' | 'manual' | 'hybrid';
  refreshFrequency: 'realtime' | 'hourly' | 'daily';
}

interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  lastSync: Date;
}
```

#### **Exportación de Datos**

```typescript
interface ExportAPI {
  formats: ['JSON', 'CSV', 'PDF', 'Excel'];
  scheduling: {
    frequency: 'daily' | 'weekly' | 'monthly';
    email: boolean;
    cloud: 'Drive' | 'Dropbox' | 'OneDrive';
  };
  customization: {
    dateRange: DateRange;
    categories: string[];
    fields: string[];
    currency: string;
  };
}
```

---

*Esta documentación se mantiene actualizada con cada release y está disponible para desarrolladores y usuarios avanzados.*
