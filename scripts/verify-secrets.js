#!/usr/bin/env node

/**
 * 🔐 Script de verificación de GitHub Secrets
 * Valida que todos los secrets necesarios estén configurados
 */

const requiredSecrets = [
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_API_KEY', 
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'FIREBASE_SERVICE_ACCOUNT_GESTOS_GASTOSV2'
];

const optionalSecrets = [
  'CODECOV_TOKEN',
  'LHCI_GITHUB_APP_TOKEN'
  // FIREBASE_TOKEN no es necesario - usas Service Account
];

function log(message, color = 'reset') {
  console.log(message);
}

function logHeader(message) {
  console.log();
  console.log(`=== ${message} ===`);
  console.log('='.repeat(50));
}

function checkSecret(secretName, isRequired = true) {
  const exists = !!process.env[secretName];
  const status = exists ? '✅ Configurado' : (isRequired ? '❌ Faltante' : '⚠️ No configurado');
  
  console.log(`  ${secretName}: ${status}`);
  return exists;
}

function main() {
  logHeader('🔐 Verificación de GitHub Secrets');
  
  console.log('\n📋 Secrets requeridos para CI/CD:');
  const missingRequired = [];
  
  requiredSecrets.forEach(secret => {
    if (!checkSecret(secret, true)) {
      missingRequired.push(secret);
    }
  });
  
  console.log('\n📋 Secrets opcionales:');
  const missingOptional = [];
  
  optionalSecrets.forEach(secret => {
    if (!checkSecret(secret, false)) {
      missingOptional.push(secret);
    }
  });
  
  // Resumen
  logHeader('📊 Resumen de configuración');
  
  console.log(`Secrets requeridos: ${requiredSecrets.length - missingRequired.length}/${requiredSecrets.length}`);
  console.log(`Secrets opcionales: ${optionalSecrets.length - missingOptional.length}/${optionalSecrets.length}`);
  
  if (missingRequired.length > 0) {
    logHeader('❌ Secrets faltantes (REQUERIDOS)');
    missingRequired.forEach(secret => {
      console.log(`  - ${secret}`);
    });
    
    console.log('\n📖 Para configurar estos secrets:');
    console.log('1. Ve a tu repositorio en GitHub');
    console.log('2. Settings > Secrets and variables > Actions');
    console.log('3. New repository secret');
    console.log('4. Consulta docs/GITHUB_SECRETS_SETUP.md para más detalles');
    
    process.exit(1);
  }
  
  if (missingOptional.length > 0) {
    logHeader('⚠️ Secrets opcionales no configurados');
    missingOptional.forEach(secret => {
      console.log(`  - ${secret}`);
    });
    console.log('\nEstos secrets mejoran la funcionalidad pero no son críticos.');
  }
  
  logHeader('✅ Configuración completada');
  console.log('Todos los secrets requeridos están configurados correctamente!');
  console.log('Los workflows de CI/CD deberían funcionar sin problemas.');
  
  // Información adicional
  console.log('\n🚀 Próximos pasos:');
  console.log('1. Push al repositorio para activar CI/CD');
  console.log('2. Crear PR para activar validación');
  console.log('3. Revisar los workflows en GitHub Actions');
}

// Ejecutar
main();
