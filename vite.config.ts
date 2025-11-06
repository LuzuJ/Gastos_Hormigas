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
    // ===== OPTIMIZACIÓN AVANZADA DE BUNDLES =====
    rollupOptions: {
      output: {
        // 🎯 Estrategia de Manual Chunks más granular
        manualChunks: (id) => {
          // Vendor chunks principales
          if (id.includes('react') && !id.includes('react-router')) {
            return 'vendor-react';
          }
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
          
          // Chunks de librerías específicas
          if (id.includes('recharts') || id.includes('chart')) {
            return 'vendor-charts';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('react-hot-toast')) {
            return 'vendor-toast';
          }
          if (id.includes('date-fns')) {
            return 'vendor-dates';
          }
          
          // Chunks de la aplicación por feature
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('/')[0] || id.split('/pages/')[1]?.split('.')[0];
            return `page-${pageName}`;
          }
          
          // Services: separar por carpeta para evitar dependencias circulares
          if (id.includes('/services/auth/') || id.includes('/services/authService')) {
            return 'app-auth';
          }
          if (id.includes('/services/financials/') || id.includes('/services/categories/')) {
            return 'app-core-services';
          }
          if (id.includes('/services/')) {
            return 'app-services';
          }
          
          if (id.includes('/contexts/') || id.includes('/hooks/')) {
            return 'app-state';
          }
          
          if (id.includes('/components/') && id.includes('Chart')) {
            return 'components-charts';
          }
          
          if (id.includes('/components/') && (
            id.includes('Modal') || 
            id.includes('Manager') || 
            id.includes('Analysis')
          )) {
            return 'components-heavy';
          }
          
          // Componentes comunes ligeros
          if (id.includes('/components/common/')) {
            return 'components-common';
          }
          
          // Node modules que no están categorizados
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
        
        // Naming strategy optimizada
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk';
          return `assets/js/${name}-[hash].js`;
        },
        
        // Assets naming optimizada
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|eot/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        }
      },
      
      // 🛡️ External dependencies para reducir bundle size
      external: (id) => {
        // Marcar como external librerías que se cargan via CDN si necesario
        return false; // Por ahora bundleamos todo
      }
    },
    
    // Configuración de build optimizada
    chunkSizeWarningLimit: 800, // KB
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Source maps configurables por entorno
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minificación avanzada
    minify: 'terser',
    terserOptions: {
      compress: {
        // Optimizaciones de producción
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        
        // Optimizaciones específicas
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        
        // Dead code elimination
        dead_code: true,
        unused: true,
        
        // Reduce file size
        reduce_vars: true,
        collapse_vars: true,
        hoist_funs: true,
        hoist_vars: true
      },
      mangle: {
        // Mantener nombres importantes para debugging
        keep_classnames: false,
        keep_fnames: false,
        safari10: true,
        
        // Properties mangling para mayor reducción (cuidado con esto)
        properties: false
      },
      format: {
        // Remover comentarios
        comments: false,
        
        // Configuración de formato
        ecma: 2020,
        safari10: true,
        webkit: true
      }
    },
    
    // Target browsers más específico
    target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Reportar bundle size
    reportCompressedSize: true
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
