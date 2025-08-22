#!/usr/bin/env node

/**
 * 🔍 Verificación Final CI/CD - Gastos Hormigas
 * 
 * Script que verifica que todo el sistema de CI/CD esté correctamente configurado
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración de colores
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`)
};

// Verificar archivos críticos
function checkCriticalFiles() {
  log.title('🔍 Verificando archivos críticos...');
  
  const criticalFiles = [
    {
      path: '.github/workflows/ci-cd.yml',
      name: 'CI/CD Principal',
      required: true
    },
    {
      path: '.github/workflows/pr-validation.yml', 
      name: 'PR Validation',
      required: true
    },
    {
      path: '.github/workflows/release.yml',
      name: 'Release Automation',
      required: true
    },
    {
      path: '.github/ISSUE_TEMPLATE/bug_report.md',
      name: 'Bug Report Template',
      required: true
    },
    {
      path: '.github/ISSUE_TEMPLATE/feature_request.md',
      name: 'Feature Request Template', 
      required: true
    },
    {
      path: '.github/PULL_REQUEST_TEMPLATE.md',
      name: 'PR Template',
      required: true
    },
    {
      path: '.github/CI-CD-SETUP.md',
      name: 'CI/CD Documentation',
      required: true
    },
    {
      path: 'firebase.json',
      name: 'Firebase Config',
      required: true
    },
    {
      path: 'package.json',
      name: 'Package Config',
      required: true
    },
    {
      path: 'scripts/setup-ci-cd.js',
      name: 'Setup Script',
      required: false
    }
  ];

  let passed = 0;
  let failed = 0;

  criticalFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      log.success(`${file.name} encontrado`);
      passed++;
    } else if (file.required) {
      log.error(`${file.name} faltante (requerido)`);
      failed++;
    } else {
      log.warning(`${file.name} faltante (opcional)`);
    }
  });

  log.info(`📊 Resultado: ${passed} encontrados, ${failed} faltantes`);
  return failed === 0;
}

// Verificar configuración de package.json
function checkPackageJson() {
  log.title('📦 Verificando package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Scripts de CI/CD
    const requiredScripts = [
      'ci:setup',
      'ci:validate', 
      'ci:deploy-staging',
      'ci:deploy-production',
      'ci:security',
      'test:coverage',
      'lint',
      'build'
    ];

    let scriptsOk = true;
    requiredScripts.forEach(script => {
      if (packageJson.scripts[script]) {
        log.success(`Script '${script}' configurado`);
      } else {
        log.error(`Script '${script}' faltante`);
        scriptsOk = false;
      }
    });

    // Dependencies críticas
    const criticalDeps = ['react', 'firebase', 'vite'];
    criticalDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        log.success(`Dependency '${dep}' encontrada`);
      } else {
        log.warning(`Dependency '${dep}' no encontrada`);
      }
    });

    // DevDependencies para testing
    const testingDeps = ['vitest', '@testing-library/react', 'eslint'];
    testingDeps.forEach(dep => {
      if (packageJson.devDependencies[dep]) {
        log.success(`Dev dependency '${dep}' encontrada`);
      } else {
        log.warning(`Dev dependency '${dep}' no encontrada`);
      }
    });

    return scriptsOk;
  } catch (error) {
    log.error('Error leyendo package.json');
    return false;
  }
}

// Verificar workflows de GitHub Actions
function checkWorkflows() {
  log.title('⚙️ Verificando workflows...');
  
  const workflows = [
    {
      file: '.github/workflows/ci-cd.yml',
      requiredJobs: ['lint-and-analyze', 'test', 'build', 'security', 'lighthouse', 'deploy-staging', 'deploy-production', 'notifications']
    },
    {
      file: '.github/workflows/pr-validation.yml',
      requiredJobs: ['validation', 'preview-build', 'deploy-preview', 'analyze-changes', 'cleanup-preview']
    },
    {
      file: '.github/workflows/release.yml', 
      requiredJobs: ['create-release', 'build-release', 'deploy-release', 'notify-release']
    }
  ];

  let allWorkflowsValid = true;

  workflows.forEach(workflow => {
    if (!fs.existsSync(workflow.file)) {
      log.error(`Workflow ${path.basename(workflow.file)} no encontrado`);
      allWorkflowsValid = false;
      return;
    }

    try {
      const content = fs.readFileSync(workflow.file, 'utf8');
      
      workflow.requiredJobs.forEach(job => {
        if (content.includes(job)) {
          log.success(`Job '${job}' encontrado en ${path.basename(workflow.file)}`);
        } else {
          log.warning(`Job '${job}' no encontrado en ${path.basename(workflow.file)}`);
        }
      });

      // Verificar triggers básicos
      if (workflow.file.includes('ci-cd')) {
        if (content.includes('push:') && content.includes('branches:')) {
          log.success('Triggers de push configurados');
        } else {
          log.warning('Triggers de push no encontrados');
        }
      }

      if (workflow.file.includes('pr-validation')) {
        if (content.includes('pull_request:')) {
          log.success('Triggers de PR configurados');
        } else {
          log.warning('Triggers de PR no encontrados');
        }
      }

    } catch (error) {
      log.error(`Error leyendo ${workflow.file}`);
      allWorkflowsValid = false;
    }
  });

  return allWorkflowsValid;
}

// Verificar configuración de Firebase
function checkFirebaseConfig() {
  log.title('🔥 Verificando configuración de Firebase...');
  
  if (!fs.existsSync('firebase.json')) {
    log.error('firebase.json no encontrado');
    return false;
  }

  try {
    const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
    
    if (firebaseConfig.hosting) {
      log.success('Configuración de hosting encontrada');
      
      // Verificar múltiples targets si es array
      if (Array.isArray(firebaseConfig.hosting)) {
        log.success('Configuración multi-target detectada');
        
        const targets = firebaseConfig.hosting.map(h => h.target).filter(Boolean);
        if (targets.includes('production') || targets.includes('staging')) {
          log.success('Targets de staging/production configurados');
        } else {
          log.warning('Targets específicos no encontrados');
        }
      } else {
        log.warning('Configuración single-target (considerar multi-target para staging)');
      }
      
      // Verificar public directory
      const publicDir = Array.isArray(firebaseConfig.hosting) 
        ? firebaseConfig.hosting[0].public 
        : firebaseConfig.hosting.public;
        
      if (publicDir === 'dist') {
        log.success('Directorio público configurado correctamente (dist)');
      } else {
        log.warning(`Directorio público: ${publicDir} (esperado: dist)`);
      }
      
      return true;
    } else {
      log.error('Configuración de hosting no encontrada');
      return false;
    }
  } catch (error) {
    log.error('Error leyendo firebase.json');
    return false;
  }
}

// Verificar estructura de directorios
function checkDirectoryStructure() {
  log.title('📁 Verificando estructura de directorios...');
  
  const requiredDirs = [
    '.github',
    '.github/workflows',
    '.github/ISSUE_TEMPLATE',
    'src',
    'public',
    'scripts'
  ];

  let allDirsExist = true;

  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      log.success(`Directorio '${dir}' encontrado`);
    } else {
      log.error(`Directorio '${dir}' faltante`);
      allDirsExist = false;
    }
  });

  return allDirsExist;
}

// Simular ejecución de tests
function checkTestability() {
  log.title('🧪 Verificando capacidad de testing...');
  
  try {
    // Verificar que el comando de test funcione
    execSync('npm run test:coverage -- --run', { 
      stdio: 'pipe',
      timeout: 30000 
    });
    log.success('Tests ejecutables correctamente');
    return true;
  } catch (error) {
    log.warning('Los tests no se ejecutaron correctamente');
    log.info('Esto puede ser normal si no hay tests o hay errores de configuración');
    return false;
  }
}

// Verificar buildability
function checkBuildability() {
  log.title('🏗️ Verificando capacidad de build...');
  
  try {
    execSync('npm run build', { 
      stdio: 'pipe',
      timeout: 60000 
    });
    log.success('Build ejecutado correctamente');
    
    // Verificar que se generó el directorio dist
    if (fs.existsSync('dist')) {
      log.success('Directorio dist generado');
      
      // Verificar archivos principales
      const buildFiles = ['index.html', 'assets'];
      buildFiles.forEach(file => {
        if (fs.existsSync(path.join('dist', file))) {
          log.success(`Build file '${file}' encontrado`);
        } else {
          log.warning(`Build file '${file}' no encontrado`);
        }
      });
      
      return true;
    } else {
      log.error('Directorio dist no generado');
      return false;
    }
  } catch (error) {
    log.error('Build falló');
    console.error(error.message);
    return false;
  }
}

// Generar reporte final
function generateReport(results) {
  log.title('📊 REPORTE FINAL DE VERIFICACIÓN');
  
  const categories = [
    { name: 'Archivos Críticos', result: results.files, weight: 20 },
    { name: 'Package.json', result: results.packageJson, weight: 15 },
    { name: 'Workflows', result: results.workflows, weight: 25 },
    { name: 'Firebase Config', result: results.firebase, weight: 15 },
    { name: 'Estructura', result: results.structure, weight: 10 },
    { name: 'Testing', result: results.testing, weight: 10 },
    { name: 'Build', result: results.build, weight: 5 }
  ];

  let totalScore = 0;
  let maxScore = 0;

  console.log('\n📋 Detalle por categoría:');
  categories.forEach(cat => {
    const status = cat.result ? '✅' : '❌';
    const score = cat.result ? cat.weight : 0;
    totalScore += score;
    maxScore += cat.weight;
    
    console.log(`  ${status} ${cat.name}: ${score}/${cat.weight} pts`);
  });

  const percentage = Math.round((totalScore / maxScore) * 100);
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 PUNTUACIÓN TOTAL: ${totalScore}/${maxScore} (${percentage}%)`);
  
  if (percentage >= 90) {
    log.success('🎉 EXCELENTE! Tu CI/CD está completamente listo');
  } else if (percentage >= 75) {
    log.warning('⚠️ BUENO: Algunas mejoras menores requeridas');
  } else if (percentage >= 50) {
    log.warning('🔧 REGULAR: Configuración adicional necesaria');
  } else {
    log.error('❌ CRÍTICO: Configuración CI/CD incompleta');
  }
  
  console.log('='.repeat(50));
  
  // Recomendaciones
  console.log('\n💡 PRÓXIMOS PASOS:');
  if (!results.files) console.log('  • Ejecutar: npm run ci:setup');
  if (!results.firebase) console.log('  • Configurar Firebase: firebase init hosting');
  if (!results.workflows) console.log('  • Verificar workflows en .github/workflows/');
  if (!results.testing) console.log('  • Agregar tests: npm run test');
  if (!results.build) console.log('  • Verificar build: npm run build');
  
  console.log('  • Configurar secrets en GitHub');
  console.log('  • Leer documentación: .github/CI-CD-SETUP.md');
  console.log('  • Hacer primer commit para activar CI/CD\n');
}

// Función principal
async function main() {
  console.clear();
  log.title('🔍 VERIFICACIÓN FINAL - CI/CD Gastos Hormigas\n');
  
  const results = {
    files: checkCriticalFiles(),
    packageJson: checkPackageJson(), 
    workflows: checkWorkflows(),
    firebase: checkFirebaseConfig(),
    structure: checkDirectoryStructure(),
    testing: checkTestability(),
    build: checkBuildability()
  };

  generateReport(results);
  
  const allPassed = Object.values(results).every(Boolean);
  process.exit(allPassed ? 0 : 1);
}

// Ejecutar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
