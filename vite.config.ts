/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', 
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts', './src/__tests__/setup/integrationSetup.ts'], 
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    testTimeout: 10000, // Timeout más largo para pruebas de integración
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
            './src/services/expensesService',
            './src/services/categoryService',
            './src/services/financialsService',
            './src/services/userService',
            './src/services/authService'
          ],
          
          // Chunk para contextos y hooks
          'app-state': [
            './src/contexts/AppContext',
            './src/hooks/useExpenses',
            './src/hooks/useCategories',
            './src/hooks/useFinancials'
          ]
        }
      }
    },
    // Aumentar el límite de advertencia a 800KB
    chunkSizeWarningLimit: 800
  }
})
