# 🐜 Gastos Hormigas - Tu Compañero Financiero Personal

[![PWA Ready](https://img.shields.io/badge/PWA-ready-green.svg)](https://gestos-gastosv2.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-ready-orange.svg)](https://firebase.google.com)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://typescriptlang.org)

Una **Progressive Web App (PWA)** moderna y completa para la gestión inteligente de finanzas personales. Controla tus gastos, planifica tu futuro financiero y alcanza tus metas con la ayuda de análisis avanzados y características premium.

## 🌟 ¿Por qué Gastos Hormigas?

**Gastos Hormigas** te ayuda a identificar y controlar esos pequeños gastos que, como hormigas, pueden parecer insignificantes individualmente pero que en conjunto impactan significativamente tu economía personal.

### 🎯 **Características Destacadas**

- 📱 **PWA Completa**: Instálala como app nativa en cualquier dispositivo
- 🔐 **Seguridad Avanzada**: Autenticación robusta con validación de contraseñas
- 🧠 **IA Integrada**: Análisis inteligente y recomendaciones personalizadas
- 📊 **Analytics Profundo**: Visualizaciones interactivas y reportes detallados
- 💰 **Multi-divisa**: Soporte para diferentes monedas
- 🌙 **Modo Offline**: Funciona sin conexión a internet
- 🎨 **Diseño Moderno**: Interfaz intuitiva con modo claro/oscuro

## ✨ Funcionalidades Principales

### 💸 **Gestión de Gastos Inteligente**
- ✅ Registro rápido con reconocimiento de patrones
- ✅ Categorización automática y personalizable
- ✅ Múltiples fuentes de pago (efectivo, tarjetas, digital)
- ✅ Detector de gastos duplicados
- ✅ Análisis de gastos hormigas (micro-gastos)

### 📊 **Dashboard Analítico**
- ✅ Métricas financieras en tiempo real
- ✅ Gráficos interactivos con Recharts
- ✅ Tendencias mensuales y anuales
- ✅ Comparativas de períodos
- ✅ Alertas y notificaciones inteligentes

### 🎯 **Presupuestos y Planificación**
- ✅ Presupuestos dinámicos por categoría
- ✅ Seguimiento de progreso visual
- ✅ Recomendaciones de ajuste automático
- ✅ Metas de ahorro con estrategias
- ✅ Planificación financiera a largo plazo

### 🔒 **Seguridad y Privacidad**
- ✅ Autenticación multi-factor
- ✅ Validación avanzada de contraseñas
- ✅ Verificación de email obligatoria
- ✅ Encriptación de datos sensibles
- ✅ Sesiones seguras con expiración automática

### 👥 **Experiencia de Usuario**
- ✅ Modo invitado para pruebas
- ✅ Onboarding interactivo
- ✅ Tutoriales contextuales
- ✅ Interfaz responsive para todos los dispositivos
- ✅ Accesibilidad optimizada (WCAG 2.1)

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 19** - Framework principal con las últimas características
- **TypeScript 5.8** - Tipado estático para mayor confiabilidad
- **Vite 6** - Build tool ultrarrápido
- **CSS Modules** - Estilos modulares y optimizados

### **Backend & Servicios**
- **Firebase Auth** - Autenticación segura
- **Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Hosting** - Hosting global optimizado
- **Service Workers** - Cache inteligente y modo offline

### **Librerías Principales**
- **Recharts** - Visualizaciones de datos interactivas
- **Lucide React** - Iconografía moderna y consistente
- **React Hot Toast** - Notificaciones elegantes
- **Zod** - Validación de esquemas robusta
- **Date-fns** - Manipulación de fechas eficiente

### **Testing & Calidad**
- **Vitest** - Framework de testing rápido
- **Testing Library** - Testing centrado en el usuario
- **ESLint** - Linting avanzado con reglas personalizadas
- **Coverage V8** - Análisis de cobertura de código

## 🚀 Inicio Rápido

### **Prerrequisitos**
- Node.js 18+ ([Descargar](https://nodejs.org))
- npm 9+ (incluido con Node.js)
- Cuenta de Firebase ([Crear cuenta](https://firebase.google.com))

### **Instalación**

1. **Clonar el repositorio**
```bash
git clone https://github.com/LuzuJ/Gastos_Hormigas.git
cd Gastos_Hormigas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
```bash
# Copiar configuración de ejemplo
cp src/config/firebase.example.ts src/config/firebase.ts

# Editar con tus credenciales de Firebase
# Obtén la configuración desde Firebase Console
```

4. **Iniciar desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:5173
```

## 📦 Comandos Disponibles

### **Desarrollo**
```bash
npm run dev                    # Servidor de desarrollo
npm run build                  # Build de producción
npm run preview               # Preview del build
npm run build:analyze         # Análisis del bundle
```

### **Testing**
```bash
npm run test                  # Ejecutar tests
npm run test:watch           # Tests en modo watch
npm run test:coverage        # Coverage completo
npm run test:unit            # Solo tests unitarios
npm run test:integration     # Solo tests de integración
```

### **Calidad**
```bash
npm run lint                 # ESLint
npm run quality:check        # Lint + tests + coverage
npm run quality:report       # Generar reporte de calidad
```

### **PWA & Deployment**
```bash
npm run pwa:build           # Build optimizado para PWA
npm run pwa:test            # Probar PWA localmente
npm run deploy:pwa          # Deploy a Firebase
npm run pwa:icons-full      # Generar todos los iconos PWA
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/              # Componentes React organizados por función
│   ├── ui/                 # Componentes base reutilizables
│   │   ├── Button/         # Botones con variantes
│   │   ├── PasswordInput/  # Input de contraseña con validación
│   │   └── ThemeToggler/   # Selector de tema
│   ├── features/           # Componentes específicos de funcionalidades
│   │   ├── expenses/       # Gestión de gastos
│   │   ├── budget/         # Presupuestos
│   │   └── analytics/      # Análisis y reportes
│   └── layout/             # Componentes de layout y navegación
├── pages/                  # Páginas principales de la aplicación
│   ├── DashboardPage/      # Panel principal
│   ├── LoginPage/          # Autenticación
│   └── ReportsPage/        # Reportes y análisis
├── hooks/                  # Custom hooks organizados por dominio
│   ├── expenses/           # Hooks para gestión de gastos
│   ├── auth/              # Hooks de autenticación
│   └── utils/             # Hooks de utilidades
├── services/               # Servicios organizados por función
│   ├── auth/              # Servicios de autenticación
│   ├── expenses/          # Servicios de gastos
│   └── firebase/          # Configuración y utilidades de Firebase
├── contexts/              # React Contexts para estado global
├── utils/                 # Utilidades y helpers
│   ├── validation/        # Validadores (Zod schemas)
│   ├── formatters/        # Formateadores de datos
│   └── constants/         # Constantes de la aplicación
├── types/                 # Definiciones de tipos TypeScript
└── config/                # Configuración (Firebase, ambiente)
```

## 🔒 Seguridad Implementada

### **Autenticación Robusta**
- ✅ Validación de contraseñas con 7 criterios de seguridad
- ✅ Verificación de email obligatoria para nuevos usuarios
- ✅ Detección de patrones de contraseñas débiles
- ✅ Rate limiting para prevenir ataques de fuerza bruta
- ✅ Sesiones con expiración automática

### **Protección de Datos**
- ✅ Reglas de Firestore con validación estricta
- ✅ Sanitización de inputs del usuario
- ✅ Encriptación en tránsito y en reposo
- ✅ Logs de seguridad y auditoría

## 📊 Estado del Proyecto

### ✅ **Fase 1 - Base Sólida** (100% Completada)
- Sistema de autenticación completo
- CRUD de gastos y categorías
- Dashboard básico funcional
- Gestión de presupuestos
- Arquitectura escalable establecida

### ✅ **Fase 2 - Características Avanzadas** (100% Completada)
- PWA completa con instalación
- Modo offline con Service Workers
- Análisis financiero avanzado
- Múltiples fuentes de pago
- Reportes interactivos
- Sistema de notificaciones

### ✅ **Preparación Fase 3** (100% Completada)
- Sistema de seguridad reforzado
- Validación avanzada de contraseñas
- Verificación de email automática
- Optimizaciones de performance
- Preparación para IA y características premium

### 🚀 **Fase 3 - Características Premium** (Próximamente)
- 🧠 Predicciones financieras con IA
- 🎯 Recomendaciones personalizadas
- 🏦 Integración con APIs bancarias
- 📈 Análisis predictivo de gastos
- 🤖 Asistente virtual financiero

## 🌐 Demo en Vivo

**🔗 URL de Producción**: [https://gestos-gastosv2.web.app](https://gestos-gastosv2.web.app)

### **Modo Invitado**
También puedes probar la aplicación usando el **modo invitado** sin necesidad de registro.

## 📱 Instalación como PWA

1. **En Escritorio (Chrome/Edge)**:
   - Abre la aplicación en el navegador
   - Busca el ícono de instalación en la barra de direcciones
   - Haz clic en "Instalar Gastos Hormigas"

2. **En Móvil (Android/iOS)**:
   - Abre la aplicación en Chrome/Safari
   - Toca el menú del navegador
   - Selecciona "Agregar a pantalla de inicio"

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Este proyecto sigue las mejores prácticas de desarrollo colaborativo.  
**Paypal**: [Paypal Luzu24Z](https://paypal.me/LuzuJ)  

### **Cómo Contribuir**

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva característica'`)
4. **Push** a la rama (`git push origin feature/NuevaCaracteristica`)
5. **Abre un Pull Request** con descripción detallada

### **Estándares de Código**
- ✅ TypeScript estricto
- ✅ ESLint + Prettier
- ✅ Tests unitarios para nuevas funcionalidades
- ✅ Documentación actualizada
- ✅ Commits descriptivos siguiendo [Conventional Commits](https://conventionalcommits.org)

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- 🔥 **Firebase** - Por la infraestructura backend robusta
- ⚛️ **React Team** - Por el framework excepcional
- 📊 **Recharts** - Por las visualizaciones elegantes
- 🎨 **Lucide** - Por la iconografía consistente
- 🧪 **Vitest** - Por el testing ultrarrápido
- 🌍 **Open Source Community** - Por las herramientas increíbles

## 📞 Soporte

¿Tienes preguntas o necesitas ayuda?

- 📧 **Email**: jonathanluzuriaga224@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/LuzuJ/Gastos_Hormigas/issues)
- 📖 **Documentación**: Ver archivos ARCHITECTURE.md y TECHNICAL.md
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/LuzuJ/Gastos_Hormigas/discussions)

---

<div align="center">

**💚 Hecho con amor para ayudarte a controlar tus finanzas 💚**

[🌟 Dar Estrella](https://github.com/LuzuJ/Gastos_Hormigas) | [🐛 Reportar Bug](https://github.com/LuzuJ/Gastos_Hormigas/issues/new?assignees=LuzuJ&labels=bug%2Ctriage&projects=&template=bug_report.md&title=%5BBUG%5D+) | [💡 Solicitar Feature](https://github.com/LuzuJ/Gastos_Hormigas/issues/new?assignees=LuzuJ&labels=enhancement%2Cfeature-request&projects=&template=feature_request.md&title=%5BFEATURE%5D+)

</div>
