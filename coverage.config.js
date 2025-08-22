// Configuración avanzada para reportes de cobertura
export default {
  // Configuración de reportes HTML
  html: {
    subdir: 'html-report',
    skipEmpty: false,
    skipFull: false
  },
  
  // Configuración de reportes de texto
  text: {
    skipEmpty: false,
    skipFull: false
  },
  
  // Configuración para LCOV (útil para CI/CD)
  lcov: {
    outputFile: 'lcov.info'
  },
  
  // Watermarks para colores en reportes
  watermarks: {
    statements: [75, 90],
    functions: [70, 85], 
    branches: [70, 80],
    lines: [75, 90]
  },
  
  // Configuración para badges de cobertura
  badges: {
    statements: {
      thresholds: {
        excellent: 90,
        good: 80,
        moderate: 70,
        poor: 50
      }
    },
    functions: {
      thresholds: {
        excellent: 85,
        good: 75,
        moderate: 65,
        poor: 45
      }
    },
    branches: {
      thresholds: {
        excellent: 80,
        good: 70,
        moderate: 60,
        poor: 40
      }
    },
    lines: {
      thresholds: {
        excellent: 90,
        good: 80,
        moderate: 70,
        poor: 50
      }
    }
  }
};
