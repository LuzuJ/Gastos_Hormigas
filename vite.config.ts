/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  base: '/', 
  plugins: [
    react(),
    // Plugin personalizado para PWA
    {
      name: 'pwa-service-worker',
      writeBundle() {
        // El service worker ya está en public/sw.js
        console.log('🔧 PWA Service Worker configurado');
      }
    },
    // Bundle analyzer - solo cuando ANALYZE=true
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'treemap', 'sunburst', 'network'
    })] : [])
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts', './src/__tests__/setup/integrationSetup.ts'], 
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    testTimeout: 10000, // Timeout más largo para pruebas de integración
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/__tests__/setup/',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'dist/',
        'coverage/',
        '**/*.config.{js,ts}',
        'scripts/',
        'public/',
        'src/main.tsx', // Entry point
        'src/debug/', // Debug utilities
        '**/*.stories.{js,ts,jsx,tsx}' // Storybook files if any
      ],
      include: [
        'src/**/*.{js,ts,jsx,tsx}'
      ],
      // Thresholds para mantener calidad
      thresholds: {
        global: {
          branches: 70,
          functions: 70, 
          lines: 75,
          statements: 75
        },
        // Thresholds específicos para archivos críticos
        'src/hooks/**/*.{js,ts,jsx,tsx}': {
          branches: 80,
          functions: 80,
          lines: 85,
          statements: 85
        },
        'src/services/**/*.{js,ts,jsx,tsx}': {
          branches: 85,
          functions: 85,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk para React y librerías principales
          'react-vendor': ['react', 'react-dom'],
          
          // Chunk para Firebase
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth', 
            'firebase/firestore'
          ],
          
          // Dividir las librerías de UI en chunks más específicos
          'icons-vendor': ['lucide-react'],
          'toast-vendor': ['react-hot-toast'],
          'charts-vendor': ['recharts'],
          
          // Chunk para servicios de la aplicación
          'app-services': [
            './src/services/expenses/expensesService',
            './src/services/categories/categoryService',
            './src/services/financials/financialsService',
            './src/services/profile/userService',
            './src/services/auth/authService'
          ],
          
          // Chunk para contextos y hooks
          'app-state': [
            './src/contexts/AppContext',
            './src/hooks/expenses/useExpenses',
            './src/hooks/categories/useCategories',
            './src/hooks/financials/useFinancials'
          ]
        }
      }
    },
    // Aumentar el límite de advertencia a 800KB
    chunkSizeWarningLimit: 800,
    // Configuración para PWA
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Deshabilitar sourcemaps en producción para menor tamaño
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log en producción
        drop_debugger: true
      }
    }
  },
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    host: true, // Permite acceso desde otros dispositivos en la red
    open: true
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'lucide-react',
      'react-hot-toast'
    ]
  }
})
