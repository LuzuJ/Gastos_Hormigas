# 🔧 Documentación Técnica - Gastos Hormigas

## 📋 Índice

- [1. Stack Tecnológico](#1-stack-tecnológico)
- [2. Configuración del Entorno](#2-configuración-del-entorno)
- [3. Arquitectura de Componentes](#3-arquitectura-de-componentes)
- [4. Estado y Gestión de Datos](#4-estado-y-gestión-de-datos)
- [5. Seguridad Implementada](#5-seguridad-implementada)
- [6. PWA y Service Workers](#6-pwa-y-service-workers)
- [7. Testing y Calidad](#7-testing-y-calidad)
- [8. Build y Deployment](#8-build-y-deployment)
- [9. Monitoring y Performance](#9-monitoring-y-performance)
- [10. APIs y Servicios](#10-apis-y-servicios)

## 1. Stack Tecnológico

### 🚀 **Frontend Core**

| Tecnología | Versión | Propósito | Configuración |
|---|---|---|---|
| **React** | 19.1.0 | Framework principal | Create React App + TypeScript |
| **TypeScript** | 5.8.0 | Tipado estático | Strict mode habilitado |
| **Vite** | 6.0.1 | Build tool | HMR + optimizaciones |
| **CSS Modules** | - | Estilos modulares | PostCSS + autoprefixer |
| **Database** | Firestore | - | NoSQL Document Database |
| **Styling** | CSS Modules | - | Scoped CSS & Theme System |

### **Development & Tools**

| Herramienta | Propósito | Configuración |
|-------------|-----------|---------------|
| **ESLint** | Code Linting | Custom rules for React/TS |
| **Vitest** | Testing Framework | Unit & Integration tests |
| **TypeScript** | Static Typing | Strict mode enabled |

### **UI & UX Libraries**

| Librería | Propósito | Uso |
|----------|-----------|-----|
| **Lucide React** | Icon System | 200+ modern icons |
| **Recharts** | Data Visualization | Charts & graphs |
| **React Hot Toast** | Notifications | User feedback |
| **Zod** | Schema Validation | Form & data validation |

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
│   └── PageProviders.tsx
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
│   ├── paymentSourceService.ts
│   ├── duplicateCleanupService.ts
│   └── financialAutomationService.ts
├── types/              # Definiciones de tipos TypeScript
│   ├── index.ts
│   └── types.ts
├── utils/              # Utilidades y helpers
│   ├── formatters.ts
│   ├── dateUtils.ts
│   └── calculations.ts
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
├── categories: Category[]
├── paymentSources: PaymentSource[]
├── expenses: Expense[]
├── financialData: FinancialData
└── achievements: Achievement[]
```

### **Core Data Models**

```typescript
interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  categoryId: string;
  subCategory: string;
  createdAt: Timestamp;
  paymentSourceId?: string;
}

interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  budget?: number;
  subcategories: SubCategory[];
}

interface PaymentSource {
  id: string;
  userId: string;
  name: string;
  type: PaymentSourceType;
  balance?: number;
  creditLimit?: number;
  isActive: boolean;
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

interface NetWorthItem {
  id: string;
  userId: string;
  name: string;
  type: 'asset' | 'liability';
  category: string;
  currentValue: number;
  lastUpdated: Timestamp;
}
```

## 🔐 Seguridad y Autenticación

### **Firebase Security Rules**

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Validation rules for expenses
    match /users/{userId}/expenses/{expenseId} {
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && validateExpense(request.resource.data);
      allow update: if request.auth != null 
        && request.auth.uid == userId
        && validateExpense(request.resource.data);
    }
  }
}

function validateExpense(expense) {
  return expense.keys().hasAll(['amount', 'description', 'categoryId'])
    && expense.amount is number
    && expense.amount > 0
    && expense.description is string
    && expense.categoryId is string;
}
```

### **Authentication Strategy**

```typescript
// Authentication service
export class AuthService {
  // Google OAuth
  async signInWithGoogle(): Promise<AuthResult> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }
  
  // Email/Password
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    return signInWithEmailAndPassword(auth, email, password);
  }
  
  // Guest mode
  async signInAsGuest(): Promise<void> {
    // Use local storage for guest data
    localStorage.setItem('guestMode', 'true');
    setGuestUser(generateGuestId());
  }
}
```

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

### **Component Styling Pattern**

```css
/* Component.module.css */
.container {
  background-color: var(--background-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.primaryButton {
  background-color: var(--primary-accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.primaryButton:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

## ⚡ Optimizaciones de Performance

### **Code Splitting & Lazy Loading**

```typescript
// Route-based code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const RegistroPage = lazy(() => import('./pages/RegistroPage'));
const PlanningPage = lazy(() => import('./pages/PlanningPage'));

// Component with suspense
function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/planning" element={<PlanningPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### **Data Fetching Optimization**

```typescript
// Custom hook with caching
export const useExpenses = (userId: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef<Map<string, Expense[]>>(new Map());
  
  useEffect(() => {
    // Check cache first
    if (cacheRef.current.has(userId)) {
      setExpenses(cacheRef.current.get(userId)!);
      setLoading(false);
      return;
    }
    
    // Firestore real-time listener
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users', userId, 'expenses'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const expenseData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Expense[];
        
        setExpenses(expenseData);
        cacheRef.current.set(userId, expenseData);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);
  
  return { expenses, loading };
};
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
          charts: ['recharts'],
          icons: ['lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/firestore']
  }
});
```

## 🧪 Testing Strategy

### **Testing Pyramid**

```
┌─────────────────────┐
│   E2E Tests (5%)    │  ← Integration tests
├─────────────────────┤
│ Integration (15%)   │  ← Component integration
├─────────────────────┤
│  Unit Tests (80%)   │  ← Vitest + Testing Library
└─────────────────────┘
```

### **Test Examples**

```typescript
// Unit Test - Service
describe('expenseService', () => {
  test('should create expense with valid data', async () => {
    const mockUser = { uid: 'test-user' };
    const expenseData = {
      amount: 100,
      description: 'Test expense',
      categoryId: 'food'
    };
    
    const result = await expenseService.createExpense(mockUser.uid, expenseData);
    
    expect(result.success).toBe(true);
    expect(result.expense).toMatchObject(expenseData);
  });
});

// Integration Test - Component
describe('ExpenseForm', () => {
  test('should create expense when form is submitted', async () => {
    const mockSubmit = vi.fn();
    render(<ExpenseForm onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/amount/i), '100');
    await userEvent.type(screen.getByLabelText(/description/i), 'Coffee');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        amount: 100,
        description: 'Coffee',
        categoryId: expect.any(String)
      });
    });
  });
});
```

## 🚀 Deployment & CI/CD

### **Firebase Hosting Configuration**

```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### **Build Process**

```bash
# Build commands
npm run build          # Production build
npm run preview        # Preview production build
npm run deploy         # Deploy to Firebase
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
export const trackError = (error: Error, context?: any) => {
  console.error('Application Error:', error, context);
  
  if (config.app.environment === 'production') {
    // Log to Firebase Analytics
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

## 🔄 Services Architecture

### **Service Layer Pattern**

```typescript
// Base service class
abstract class BaseService<T> {
  protected collection: string;
  
  constructor(collection: string) {
    this.collection = collection;
  }
  
  abstract create(userId: string, data: Partial<T>): Promise<ServiceResult<T>>;
  abstract update(userId: string, id: string, data: Partial<T>): Promise<ServiceResult<T>>;
  abstract delete(userId: string, id: string): Promise<ServiceResult<void>>;
  abstract getAll(userId: string): Promise<ServiceResult<T[]>>;
}

// Implementation example
export class ExpenseService extends BaseService<Expense> {
  constructor() {
    super('expenses');
  }
  
  async create(userId: string, data: Partial<Expense>): Promise<ServiceResult<Expense>> {
    try {
      const docRef = await addDoc(
        collection(db, 'users', userId, this.collection),
        {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );
      
      return {
        success: true,
        data: { id: docRef.id, ...data } as Expense
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### **Context Pattern for State Management**

```typescript
// ExpensesContext.tsx
interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  addExpense: (expense: Partial<Expense>) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const ExpensesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const addExpense = useCallback(async (expenseData: Partial<Expense>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await expenseService.create(user.uid, expenseData);
      if (result.success) {
        setExpenses(prev => [result.data!, ...prev]);
      } else {
        setError(result.error!);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  return (
    <ExpensesContext.Provider value={{
      expenses,
      loading,
      error,
      addExpense,
      updateExpense,
      deleteExpense
    }}>
      {children}
    </ExpensesContext.Provider>
  );
};
```

## 📈 Roadmap Técnico

### **Próximas Mejoras**

1. **Performance**
   - Service Worker para offline support
   - Virtual scrolling para listas grandes
   - Database query optimization
   - Image optimization y lazy loading

2. **Features**
   - Real-time collaborative budgets
   - AI-powered expense categorization
   - Advanced reporting with PDF export
   - Mobile app con Capacitor

3. **Technical Debt**
   - Migration a React Query para caching
   - Update a Vite 7
   - Enhanced TypeScript strict mode
   - Micro-frontend architecture

4. **Testing**
   - Increase test coverage to 90%
   - Add visual regression testing
   - Performance testing automation
   - E2E testing con Playwright

---

*Este documento es mantenido por el equipo de desarrollo y se actualiza con cada release mayor.*
