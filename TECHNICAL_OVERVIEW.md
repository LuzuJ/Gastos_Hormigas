# 🔧 Technical Overview - Gastos Hormigas

## 📋 Resumen Ejecutivo

**Gastos Hormigas** es una aplicación web moderna de gestión financiera personal construida con React, TypeScript y Firebase. Diseñada con arquitectura escalable, patrones de desarrollo modernos y enfoque en la experiencia de usuario.

## 🏗️ Arquitectura del Sistema

### **Frontend Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │ Components  │  │   Hooks     │     │
│  │             │  │             │  │             │     │
│  │ • Dashboard │  │ • ExpenseForm│ │ • useExpenses│     │
│  │ • Registro  │  │ • Charts    │  │ • useAuth   │     │
│  │ • Planning  │  │ • Modals    │  │ • useTheme  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│              Context Providers & State                 │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Auth      │  │ Expenses    │  │ Financials  │     │
│  │  Context    │  │  Context    │  │  Context    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                Firebase Services                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Auth     │  │  Firestore  │  │   Hosting   │     │
│  │             │  │             │  │             │     │
│  │ • Google    │  │ • Real-time │  │ • Static    │     │
│  │ • Email     │  │ • Security  │  │ • CDN       │     │
│  │ • Guest     │  │ • Offline   │  │ • SSL       │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### **Core Technologies**

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| **Framework** | React | 18.x | UI Library para SPA |
| **Language** | TypeScript | 5.x | Type Safety & Developer Experience |
| **Build Tool** | Vite | 6.x | Dev Server & Build Optimization |
| **Backend** | Firebase | 10.x | Authentication, Database, Hosting |
| **Database** | Firestore | - | NoSQL Document Database |
| **Styling** | CSS Modules | - | Scoped CSS & Theme System |

### **Development & Tools**

| Herramienta | Propósito | Configuración |
|-------------|-----------|---------------|
| **ESLint** | Code Linting | Custom rules for React/TS |
| **Prettier** | Code Formatting | Auto-format on save |
| **Husky** | Git Hooks | Pre-commit validation |
| **Testing** | Vitest + Testing Library | Unit & Integration tests |

### **UI & UX Libraries**

| Librería | Propósito | Uso |
|----------|-----------|-----|
| **Lucide React** | Icon System | 200+ modern icons |
| **Recharts** | Data Visualization | Charts & graphs |
| **React Hook Form** | Form Management | Type-safe forms |
| **React Hot Toast** | Notifications | User feedback |

## 📂 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── BudgetProgressBar/
│   ├── ExpenseFilter/
│   ├── ExpenseForm/
│   ├── ExpenseList/
│   ├── Layout/
│   ├── LoadingState/
│   ├── modals/
│   │   ├── ConfirmDialog/
│   │   ├── InputDialog/
│   │   └── CategoryStyleModal/
│   └── charts/
│       ├── ExpenseChart/
│       ├── MonthlyTrendChart/
│       └── ComparativeChart/
├── contexts/            # Estado global de la aplicación
│   ├── AuthContext.tsx
│   ├── ExpensesContext.tsx
│   ├── FinancialsContext.tsx
│   ├── NotificationsContext.tsx
│   └── PlanningContext.tsx
├── hooks/              # Custom React Hooks
│   ├── useAuth.ts
│   ├── useExpenses.ts
│   ├── useFinancials.ts
│   ├── useTheme.ts
│   └── useNotifications.ts
├── pages/              # Páginas principales
│   ├── DashboardPage.tsx
│   ├── RegistroPage.tsx
│   ├── PlanningPage.tsx
│   ├── LoginPage.tsx
│   └── ManageCategoriesPage.tsx
├── services/           # Servicios externos y APIs
│   ├── firebase.ts
│   ├── expenseService.ts
│   ├── categoryService.ts
│   └── userService.ts
├── types/              # Definiciones de tipos TypeScript
│   ├── index.ts
│   ├── expense.ts
│   ├── user.ts
│   └── financial.ts
├── assets/             # Recursos estáticos
│   └── icons/
└── __tests__/          # Tests unitarios e integración
    ├── components/
    ├── hooks/
    └── integration/
```

## 🗄️ Modelo de Datos

### **Firestore Collections Structure**

```typescript
// Users Collection
users/{userId}
├── profile: UserProfile
├── settings: UserSettings
└── categories: Category[]

// Expenses Collection  
expenses/{expenseId}
├── userId: string
├── amount: number
├── description: string
├── categoryId: string
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── metadata: ExpenseMetadata

// Categories Collection
categories/{categoryId}
├── userId: string
├── name: string
├── icon: string
├── color: string
├── isDefault: boolean
└── budget?: number

// Financial Data Collection
financialData/{userId}
├── monthlyBudgets: MonthlyBudget[]
├── savingsGoals: SavingsGoal[]
├── fixedExpenses: FixedExpense[]
├── incomes: Income[]
└── netWorth: NetWorthData
```

### **TypeScript Interfaces**

```typescript
interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  categoryId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isRecurring?: boolean;
  tags?: string[];
}

interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  budget?: number;
  description?: string;
}

interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Timestamp;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
}

interface DebtPaymentStrategy {
  id: string;
  userId: string;
  type: 'snowball' | 'avalanche';
  liabilities: Liability[];
  monthlyPayment: number;
  projectedPayoffDate: Date;
  totalInterestSaved: number;
}
```

## 🔐 Seguridad e Autenticación

### **Firebase Security Rules**

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /categories/{categoryId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    match /financialData/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

### **Authentication Strategy**

- **Multi-Provider Support**: Google, Email/Password, Guest Mode
- **JWT Token Management**: Automatic token refresh
- **Session Persistence**: Local storage with secure handling
- **Protected Routes**: Route guards with auth state
- **Data Isolation**: User-specific data access only

## 🎨 Sistema de Theming

### **CSS Custom Properties**

```css
:root {
  /* Light Theme */
  --primary-accent: #3b82f6;
  --background-primary: #ffffff;
  --background-card: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}

[data-theme="dark"] {
  /* Dark Theme */
  --primary-accent: #60a5fa;
  --background-primary: #0f172a;
  --background-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}
```

### **Responsive Design System**

```css
/* Mobile First Approach */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1024px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

## ⚡ Optimizaciones de Performance

### **Code Splitting & Lazy Loading**

```typescript
// Route-based code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const RegistroPage = lazy(() => import('./pages/RegistroPage'));
const PlanningPage = lazy(() => import('./pages/PlanningPage'));

// Component-based lazy loading
const ExpenseChart = lazy(() => import('./components/ExpenseChart'));
```

### **Data Fetching Optimization**

```typescript
// React Query para caching y sincronización
const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => expenseService.getExpenses(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Firestore real-time listeners con cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'expenses'),
    (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expenses);
    }
  );
  
  return () => unsubscribe();
}, []);
```

### **Bundle Optimization**

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['recharts']
        }
      }
    }
  }
});
```

## 🧪 Testing Strategy

### **Testing Pyramid**

```
┌─────────────────────┐
│   E2E Tests (5%)    │  ← Cypress/Playwright
├─────────────────────┤
│ Integration (15%)   │  ← React Testing Library
├─────────────────────┤
│  Unit Tests (80%)   │  ← Vitest + Jest
└─────────────────────┘
```

### **Test Examples**

```typescript
// Unit Test - Custom Hook
describe('useExpenses', () => {
  test('should fetch expenses for authenticated user', async () => {
    const { result } = renderHook(() => useExpenses(), {
      wrapper: QueryClientWrapper
    });
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});

// Integration Test - Component
describe('ExpenseForm', () => {
  test('should create expense when form is submitted', async () => {
    render(<ExpenseForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '100' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        amount: 100,
        description: expect.any(String),
        categoryId: expect.any(String)
      });
    });
  });
});
```

## 🚀 Deployment & CI/CD

### **Build Process**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: gastos-hormigas
```

### **Environment Configuration**

```typescript
// src/config/environment.ts
export const config = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  },
  app: {
    name: 'Gastos Hormigas',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE
  }
};
```

## 📊 Monitoring & Analytics

### **Error Tracking**

```typescript
// src/services/errorTracking.ts
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

export const trackError = (error: Error, context?: any) => {
  console.error('Application Error:', error, context);
  
  if (config.app.environment === 'production') {
    logEvent(analytics, 'exception', {
      description: error.message,
      fatal: false,
      custom_parameter: context
    });
  }
};

export const trackUserAction = (action: string, params?: any) => {
  logEvent(analytics, action, params);
};
```

### **Performance Metrics**

```typescript
// Performance monitoring
const reportWebVitals = (metric: any) => {
  switch (metric.name) {
    case 'CLS':
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      trackUserAction('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value
      });
      break;
    default:
      break;
  }
};
```

## 🔧 Development Setup

### **Prerequisites**

- Node.js 18+
- npm 9+
- Firebase CLI
- Git

### **Installation Steps**

```bash
# Clone repository
git clone https://github.com/LuzuJ/Gastos_Hormigas.git
cd Gastos_Hormigas

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### **Development Scripts**

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler |

## 📈 Roadmap Técnico

### **Próximas Mejoras**

1. **Performance**
   - Service Worker para offline support
   - Image optimization y lazy loading
   - Database query optimization

2. **Features**
   - Real-time collaborative budgets
   - AI-powered expense categorization
   - Advanced reporting with PDF export

3. **Technical Debt**
   - Migration to React Query v5
   - Update to Vite 7
   - Enhanced TypeScript strict mode

4. **Testing**
   - Increase test coverage to 90%
   - Add visual regression testing
   - Performance testing automation

---

*Este documento es mantenido por el equipo de desarrollo y se actualiza con cada release mayor.*
