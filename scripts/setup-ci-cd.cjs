#!/usr/bin/env node

/**
 * 🔧 Setup Script para CI/CD - Gastos Hormigas
 * 
 * Este script automatiza la configuración inicial del CI/CD
 * incluyendo Firebase, secrets y verificaciones.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración de colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bright}🚀 ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}📋${colors.reset} ${msg}`)
};

// Interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

// Función para ejecutar comandos
const exec = (command, options = {}) => {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    if (!options.allowFailure) {
      log.error(`Error ejecutando: ${command}`);
      throw error;
    }
    return null;
  }
};

// Verificar si un comando existe
const commandExists = (command) => {
  try {
    exec(`${command} --version`, { silent: true });
    return true;
  } catch {
    return false;
  }
};

// Verificar herramientas requeridas
async function checkRequirements() {
  log.title('Verificando herramientas requeridas...');
  
  const requirements = [
    { command: 'node', name: 'Node.js' },
    { command: 'npm', name: 'npm' },
    { command: 'git', name: 'Git' },
    { command: 'gh', name: 'GitHub CLI', optional: true },
    { command: 'firebase', name: 'Firebase CLI', optional: true }
  ];

  let allRequired = true;
  let optionalMissing = [];

  for (const req of requirements) {
    if (commandExists(req.command)) {
      log.success(`${req.name} está instalado`);
    } else if (req.optional) {
      log.warning(`${req.name} no está instalado (opcional)`);
      optionalMissing.push(req);
    } else {
      log.error(`${req.name} es requerido pero no está instalado`);
      allRequired = false;
    }
  }

  if (!allRequired) {
    log.error('Instala las herramientas requeridas antes de continuar');
    process.exit(1);
  }

  if (optionalMissing.length > 0) {
    log.warning('Herramientas opcionales faltantes:');
    optionalMissing.forEach(req => {
      console.log(`  - ${req.name}: Instalar con npm install -g ${req.command}`);
    });
    
    const proceed = await question('\n¿Continuar sin herramientas opcionales? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      process.exit(0);
    }
  }
}

// Verificar estructura del proyecto
function checkProjectStructure() {
  log.title('Verificando estructura del proyecto...');
  
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'src/main.tsx',
    '.github/workflows/ci-cd.yml'
  ];

  const requiredDirs = [
    'src',
    'public',
    '.github/workflows'
  ];

  let structureValid = true;

  // Verificar archivos
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log.success(`Archivo encontrado: ${file}`);
    } else {
      log.error(`Archivo faltante: ${file}`);
      structureValid = false;
    }
  }

  // Verificar directorios
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      log.success(`Directorio encontrado: ${dir}`);
    } else {
      log.error(`Directorio faltante: ${dir}`);
      structureValid = false;
    }
  }

  if (!structureValid) {
    log.error('Estructura del proyecto incompleta');
    process.exit(1);
  }

  log.success('Estructura del proyecto verificada');
}

// Configurar Firebase
async function setupFirebase() {
  log.title('Configurando Firebase...');
  
  if (!commandExists('firebase')) {
    log.warning('Firebase CLI no está instalado');
    const install = await question('¿Instalar Firebase CLI? (y/N): ');
    if (install.toLowerCase() === 'y') {
      log.step('Instalando Firebase CLI...');
      exec('npm install -g firebase-tools');
    } else {
      log.warning('Saltando configuración de Firebase');
      return;
    }
  }

  // Verificar login
  try {
    exec('firebase projects:list', { silent: true });
    log.success('Usuario autenticado en Firebase');
  } catch {
    log.step('Autenticando en Firebase...');
    exec('firebase login');
  }

  // Verificar proyecto existente
  const hasFirebaseJson = fs.existsSync('firebase.json');
  if (hasFirebaseJson) {
    log.success('firebase.json encontrado');
  } else {
    log.step('Inicializando Firebase Hosting...');
    exec('firebase init hosting');
  }

  // Configurar proyectos de staging y producción
  const projectId = await question('ID del proyecto de producción (ej: gastos-hormigas): ');
  const stagingId = await question(`ID del proyecto de staging (ej: ${projectId}-staging): `);

  // Actualizar firebase.json para múltiples proyectos
  const firebaseConfig = {
    hosting: [
      {
        target: "production",
        public: "dist",
        ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
        rewrites: [{ source: "**", destination: "/index.html" }]
      },
      {
        target: "staging", 
        public: "dist",
        ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
        rewrites: [{ source: "**", destination: "/index.html" }]
      }
    ]
  };

  fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
  log.success('firebase.json configurado para múltiples entornos');

  // Configurar targets
  exec(`firebase target:apply hosting production ${projectId}`);
  exec(`firebase target:apply hosting staging ${stagingId}`);
  
  log.success('Targets de Firebase configurados');
}

// Configurar GitHub Secrets
async function setupGitHubSecrets() {
  log.title('Configurando GitHub Secrets...');
  
  if (!commandExists('gh')) {
    log.warning('GitHub CLI no está instalado');
    log.info('Configura manualmente los secrets en GitHub:');
    log.info('Settings → Secrets and variables → Actions');
    return;
  }

  // Verificar autenticación
  try {
    exec('gh auth status', { silent: true });
    log.success('Autenticado en GitHub');
  } catch {
    log.step('Autenticando en GitHub...');
    exec('gh auth login');
  }

  log.step('Listando secrets requeridos...');
  
  const secrets = [
    'FIREBASE_SERVICE_ACCOUNT_PRODUCTION',
    'FIREBASE_SERVICE_ACCOUNT_STAGING', 
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'CODECOV_TOKEN',
    'LHCI_GITHUB_APP_TOKEN'
  ];

  log.info('Secrets requeridos:');
  secrets.forEach(secret => console.log(`  - ${secret}`));
  
  const configure = await question('\n¿Configurar secrets ahora? (y/N): ');
  if (configure.toLowerCase() !== 'y') {
    log.warning('Configura los secrets manualmente después');
    return;
  }

  // Configurar secrets interactivamente
  for (const secret of secrets) {
    const value = await question(`Valor para ${secret} (Enter para saltar): `);
    if (value.trim()) {
      try {
        exec(`gh secret set ${secret} --body "${value}"`, { silent: true });
        log.success(`Secret ${secret} configurado`);
      } catch {
        log.error(`Error configurando ${secret}`);
      }
    }
  }
}

// Verificar workflows
function verifyWorkflows() {
  log.title('Verificando workflows...');
  
  const workflows = [
    '.github/workflows/ci-cd.yml',
    '.github/workflows/pr-validation.yml', 
    '.github/workflows/release.yml'
  ];

  let allValid = true;

  for (const workflow of workflows) {
    if (fs.existsSync(workflow)) {
      log.success(`Workflow encontrado: ${path.basename(workflow)}`);
    } else {
      log.error(`Workflow faltante: ${path.basename(workflow)}`);
      allValid = false;
    }
  }

  if (!allValid) {
    log.error('Algunos workflows están faltantes');
    log.info('Asegúrate de que todos los workflows estén en .github/workflows/');
  } else {
    log.success('Todos los workflows están configurados');
  }
}

// Test de CI/CD
async function testCICD() {
  log.title('Probando CI/CD...');
  
  const test = await question('¿Hacer commit de prueba para activar CI/CD? (y/N): ');
  if (test.toLowerCase() !== 'y') {
    log.warning('Saltando test de CI/CD');
    return;
  }

  try {
    // Crear commit de test
    exec('git add .');
    exec('git commit -m "ci: setup CI/CD automation" --allow-empty');
    
    log.step('Enviando cambios...');
    exec('git push');
    
    log.success('Commit de prueba enviado');
    log.info('Revisa GitHub Actions para ver el estado de los workflows');
    
    if (commandExists('gh')) {
      exec('gh workflow list');
    }
  } catch (error) {
    log.error('Error en test de CI/CD');
    console.error(error.message);
  }
}

// Función principal
async function main() {
  try {
    console.clear();
    log.title('🔧 Setup CI/CD - Gastos Hormigas');
    console.log('Este script configurará automáticamente tu entorno de CI/CD\n');

    await checkRequirements();
    checkProjectStructure();
    await setupFirebase();
    await setupGitHubSecrets();
    verifyWorkflows();
    await testCICD();

    console.log('\n' + '='.repeat(60));
    log.success('🎉 ¡Configuración de CI/CD completada!');
    console.log('\n📚 Próximos pasos:');
    console.log('  1. Revisa GitHub Actions para ver los workflows');
    console.log('  2. Configura secrets faltantes si es necesario');
    console.log('  3. Haz un Pull Request para probar el workflow de PR');
    console.log('  4. Crea un tag para probar el workflow de release');
    console.log('\n📖 Documentación: .github/CI-CD-SETUP.md');
    console.log('='.repeat(60));

  } catch (error) {
    log.error('Error durante la configuración:');
    console.error(error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, checkRequirements, setupFirebase, setupGitHubSecrets };
