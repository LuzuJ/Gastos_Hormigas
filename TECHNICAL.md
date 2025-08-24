# 🛠️ Gastos Hormigas - Documentación Técnica

[![CI/CD](https://github.com/LuzuJ/Gastos_Hormigas/actions/workflows/ci-cd-simple.yml/badge.svg)](https://github.com/LuzuJ/Gastos_Hormigas/actions/workflows/ci-cd-simple.yml)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-green.svg)](https://gestos-gastosv2.web.app)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-360%2F360-brightgreen.svg)](https://github.com/LuzuJ/Gastos_Hormigas/actions)

> **Documentación técnica completa para desarrolladores**

## 📋 Tabla de Contenidos

- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Configuración de Desarrollo](#-configuración-de-desarrollo)
- [📦 Estructura del Proyecto](#-estructura-del-proyecto)
- [🧪 Testing](#-testing)
- [🔧 CI/CD](#-cicd)
- [🎨 Configuración PWA](#-configuración-pwa)
- [🔒 Seguridad](#-seguridad)
- [📊 Monitoreo y Analytics](#-monitoreo-y-analytics)
- [🚀 Deployment](#-deployment)
- [🤝 Contribución](#-contribución)

## 🛠️ Stack Tecnológico

### Frontend Core
- **React 19** - Framework principal con Suspense y Concurrent Features
- **TypeScript 5.8** - Tipado estático estricto
- **Vite 6** - Build tool y dev server ultra-rápido
- **CSS Modules** - Estilos encapsulados con soporte para CSS custom properties

### Backend & Infrastructure
- **Firebase Auth** - Autenticación (Email/Password, Google, Anonymous)
- **Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Hosting** - Hosting PWA con CDN global
- **Firebase Performance** - Monitoreo de rendimiento

### Librerías Principales
```json
{
  "react": "^19.0.0",
  "typescript": "^5.8.0",
  "firebase": "^12.1.0",
  "react-router-dom": "^6.28.0",
  "chart.js": "^4.4.6",
  "date-fns": "^4.1.0",
  "zod": "^3.23.8"
}
```

### Herramientas de Desarrollo
- **Vitest** - Framework de testing ultra-rápido
- **Testing Library** - Utilities para testing de componentes
- **ESLint** - Linting con reglas estrictas
- **Prettier** - Formateo automático de código

## 🏗️ Arquitectura

### Patrón de Arquitectura
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Presentation │    │     Business    │    │      Data       │
│     (Components) │◄──►│    (Contexts)   │◄──►│   (Services)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Hooks      │    │      Types      │    │    Firebase     │
│   (Business)    │    │   (Schemas)     │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Gestión de Estado
- **React Context** - Estado global de la aplicación
- **Reducer Pattern** - Para operaciones complejas
- **Local State** - Para estado de componente específico
- **Firebase Realtime** - Sincronización automática

### Estructura de Contexts
```typescript
// Context Hierarchy
AppContext (root)
├── AuthContext (authentication)
├── ExpensesContext (expense management)
├── FinancialsContext (budgets, goals)
├── PlanningContext (debt, savings)
└── NotificationsContext (alerts)
```

## 🚀 Configuración de Desarrollo

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Firebase CLI** ≥ 13.0.0

### Instalación Completa

```bash
# 1. Clonar repositorio
git clone https://github.com/LuzuJ/Gastos_Hormigas.git
cd Gastos_Hormigas

# 2. Instalar dependencias
npm install

# 3. Configurar Firebase CLI (opcional para desarrollo)
npm install -g firebase-tools
firebase login

# 4. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales Firebase
```

### Variables de Entorno

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Development Settings
VITE_NODE_ENV=development
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Scripts de Desarrollo

```bash
# Desarrollo con hot reload
npm run dev

# Desarrollo con Firebase Emulators
npm run dev:emulator

# Build para producción
npm run build

# Preview del build
npm run preview

# Tests
npm test                 # Ejecutar todos los tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Coverage report
npm run test:ui         # Vitest UI

# Linting y Formatting
npm run lint            # ESLint check
npm run lint:fix        # Fix automático
npm run format          # Prettier format

# Firebase
npm run firebase:serve  # Emulators locales
npm run firebase:deploy # Deploy a producción
```

## 📦 Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables
│   ├── common/         # Componentes base (Button, Card, Modal)
│   ├── forms/          # Formularios específicos
│   ├── features/       # Componentes por feature
│   │   ├── expenses/   # Gestión de gastos
│   │   ├── budgets/    # Presupuestos
│   │   ├── planning/   # Planificación financiera
│   │   └── analytics/  # Dashboard y gráficos
│   └── Layout/         # Layout y navegación
├── contexts/           # React Contexts para estado global
├── hooks/              # Custom hooks
├── services/           # Servicios (Firebase, API calls)
├── utils/              # Utilities y helpers
├── types/              # TypeScript type definitions
├── constants/          # Constantes de la aplicación
├── pages/              # Páginas principales
└── __tests__/          # Tests organizados por tipo
    ├── unit/           # Tests unitarios
    ├── integration/    # Tests de integración
    └── e2e/            # Tests end-to-end (futuro)
```

### Convenciones de Naming

```typescript
// Componentes - PascalCase
export const ExpenseForm: React.FC = () => {};

// Hooks - camelCase con prefijo 'use'
export const useExpenses = () => {};

// Services - camelCase
export const authService = {};

// Types - PascalCase con sufijo descriptivo
export interface ExpenseFormData {}
export type ExpenseStatus = 'pending' | 'completed';

// Constants - UPPER_SNAKE_CASE
export const MAX_EXPENSE_AMOUNT = 1000000;

// Files - kebab-case para componentes, camelCase para utilities
ExpenseForm.tsx
ExpenseForm.module.css
expenseUtils.ts
```

## 🧪 Testing

### Estrategia de Testing
- **Unit Tests**: Hooks, utilities, services
- **Integration Tests**: Componentes con contextos
- **Component Tests**: Renderizado y interacciones
- **E2E Tests**: Flujos completos de usuario (roadmap)

### Configuración Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
});
```

### Firebase Mocking

```typescript
// setupTests.ts
import { vi } from 'vitest';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
}));
```

### Ejecutar Tests

```bash
# Tests básicos
npm test

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test ExpenseForm
npm test -- --grep="authentication"

# Tests en watch mode
npm run test:watch

# Vitest UI (browser)
npm run test:ui
```

## 🔧 CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd-simple.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

### Status Badges

- ✅ **360/360 tests passing** - Suite completa de tests
- ✅ **Build successful** - TypeScript compilation sin errores
- ✅ **Linting passed** - Código siguiendo estándares
- ✅ **Deploy automated** - Deployment automático desde main

## 🎨 Configuración PWA

### Manifest Configuration

```json
// public/manifest.json
{
  "name": "Gastos Hormigas",
  "short_name": "GastosHormigas",
  "description": "Gestión inteligente de finanzas personales",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "categories": ["finance", "productivity"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

```typescript
// public/sw.js - Service Worker Registration
const CACHE_NAME = 'gastos-hormigas-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Vite PWA Plugin

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
```

## 🔒 Seguridad

### Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Expenses subcollection
      match /expenses/{expenseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Budgets subcollection
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Global categories (read-only)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Input Validation con Zod

```typescript
// schemas.ts
import { z } from 'zod';

export const ExpenseSchema = z.object({
  amount: z.number()
    .positive('El monto debe ser positivo')
    .max(1000000, 'Monto máximo excedido'),
  description: z.string()
    .min(1, 'Descripción requerida')
    .max(200, 'Descripción muy larga'),
  category: z.string()
    .min(1, 'Categoría requerida'),
  date: z.date()
});

export type ExpenseFormData = z.infer<typeof ExpenseSchema>;
```

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.gstatic.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com;">
```

## 📊 Monitoreo y Analytics

### Firebase Performance

```typescript
// config/firebase.ts
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// Custom traces
export const traceExpenseCreation = () => {
  const trace = perf.trace('expense_creation');
  trace.start();
  return trace;
};
```

### Error Monitoring

```typescript
// utils/errorTracking.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

export const logError = async (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const functions = getFunctions();
      const logErrorFunction = httpsCallable(functions, 'logError');
      await logErrorFunction({
        message: error.message,
        stack: error.stack,
        context,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }
  console.error(`[${context}]:`, error);
};
```

### Bundle Analysis

```bash
# Analizar bundle size
npm run build
npm run analyze

# Resultados típicos:
# vendor-firebase.js  349KB (106KB gzipped)
# vendor-react.js     238KB (78KB gzipped)  
# app.js             156KB (45KB gzipped)
# Total: ~743KB (229KB gzipped)
```

## 🚀 Deployment

### Firebase Hosting

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
        "source": "**/*.@(js|css|png|jpg|jpeg|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

### Deploy Commands

```bash
# Manual deployment
npm run build
firebase deploy

# CI/CD deployment (automático en push a main)
git push origin main

# Preview deployment
firebase hosting:channel:deploy preview-feature-x

# Rollback deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

### Environment Setup

```bash
# Production
firebase use production
npm run build
firebase deploy

# Staging  
firebase use staging
npm run build:staging
firebase deploy

# Development
firebase use development
npm run dev
```

## 🤝 Contribución

### Flujo de Desarrollo

```bash
# 1. Crear branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollo
# - Escribir tests primero (TDD)
# - Implementar funcionalidad
# - Asegurar que todos los tests pasen

# 3. Commit con conventional commits
git add .
git commit -m "feat: agregar funcionalidad de exportación de datos"

# 4. Push y PR
git push origin feature/nueva-funcionalidad
# Crear PR desde GitHub hacia develop
```

### Conventional Commits

```bash
# Tipos de commits
feat:     Nueva funcionalidad
fix:      Bug fix
docs:     Documentación
style:    Formato de código
refactor: Refactoring
test:     Tests
chore:    Mantenimiento

# Ejemplos
feat: agregar dashboard de analytics
fix: resolver problema de autenticación en móvil
docs: actualizar README con instrucciones de deployment
test: agregar tests para ExpenseForm component
```

### Code Review Checklist

- [ ] ✅ **Tests**: Todos los tests pasan (360/360)
- [ ] ✅ **TypeScript**: Sin errores de compilación
- [ ] ✅ **Linting**: ESLint pasa sin warnings
- [ ] ✅ **Performance**: No regresiones en bundle size
- [ ] ✅ **Security**: Input validation y sanitización
- [ ] ✅ **Accessibility**: ARIA labels y navegación por teclado
- [ ] ✅ **Mobile**: Testing en dispositivos móviles
- [ ] ✅ **Documentation**: Código documentado y README actualizado

### Release Process

```bash
# 1. Merge develop a main
git checkout main
git merge develop
git push origin main

# 2. Tag release
git tag -a v1.2.0 -m "Release 1.2.0: Analytics dashboard"
git push origin v1.2.0

# 3. GitHub Release
# - Crear release en GitHub
# - Documentar changelog
# - Adjuntar build artifacts

# 4. Deploy automático via CI/CD
# - GitHub Actions detecta push a main
# - Ejecuta tests y build
# - Deploya a Firebase Hosting
```

---

## 📚 Recursos Adicionales

### Documentación Externa
- [React 19 Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Vitest Documentation](https://vitest.dev)

### Tools y Utilities
- [Firebase Console](https://console.firebase.google.com)
- [GitHub Actions](https://github.com/LuzuJ/Gastos_Hormigas/actions)
- [Bundle Analyzer](https://bundlephobia.com)

---

**Desarrollado con ❤️ por [LuzuJ](https://github.com/LuzuJ)**  
*Contribuciones bienvenidas - lee [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles*
