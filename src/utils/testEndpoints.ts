import { supabase } from '../config/supabase';
import { runSchemaDiagnostic, generateFixSQL } from './schemaDiagnostic';

/**
 * 🧪 SCRIPT DE PRUEBA DE ENDPOINTS
 * 
 * Este script prueba todos los endpoints de la aplicación
 * para verificar que funcionen correctamente después de
 * la migración de Firebase a Supabase.
 */

// ========================================
// COLORES PARA CONSOLA
// ========================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type: 'success' | 'error' | 'info' | 'test', message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    test: '🧪',
  };
  const color = {
    success: colors.green,
    error: colors.red,
    info: colors.cyan,
    test: colors.blue,
  };

  console.log(`${color[type]}${icons[type]} [${timestamp}] ${message}${colors.reset}`);
}

// ========================================
// TEST DE CONEXIÓN A SUPABASE
// ========================================
export async function testSupabaseConnection(): Promise<boolean> {
  log('test', 'Probando conexión a Supabase...');

  try {
    // Intentar hacer una consulta simple
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      log('error', `Error de conexión: ${error.message}`);
      return false;
    }

    log('success', 'Conexión a Supabase exitosa');
    return true;
  } catch (err) {
    log('error', `Excepción al conectar: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

// ========================================
// TEST DE AUTENTICACIÓN
// ========================================
export async function testAuthEndpoints() {
  log('test', 'Probando endpoints de autenticación...');

  const results = {
    getCurrentUser: false,
    session: false,
  };

  try {
    // Verificar usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    results.getCurrentUser = true;
    log('info', `Usuario actual: ${user ? user.email : 'No autenticado'}`);

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    results.session = true;
    log('info', `Sesión activa: ${session ? 'Sí' : 'No'}`);

    log('success', 'Endpoints de autenticación funcionando');
  } catch (err) {
    log('error', `Error en autenticación: ${err instanceof Error ? err.message : String(err)}`);
  }

  return results;
}

// ========================================
// TEST DE ENDPOINTS DE LECTURA
// ========================================
export async function testReadEndpoints() {
  log('test', 'Probando endpoints de lectura (SELECT)...');

  const results: Record<string, boolean> = {};

  // Lista de tablas a probar
  const tables = [
    'users',
    'categories',
    'subcategories',
    'payment_sources',
    'expenses',
    'fixed_expenses',
    'financials',
    'savings_goals',
    'liabilities',
    'incomes',
    'achievements',
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select('*')
        .limit(5);

      if (error) {
        log('error', `❌ ${table}: ${error.message}`);
        results[table] = false;
      } else {
        log('success', `✅ ${table}: ${data?.length || 0} registros encontrados`);
        results[table] = true;
      }
    } catch (err) {
      log('error', `❌ ${table}: Excepción - ${err instanceof Error ? err.message : String(err)}`);
      results[table] = false;
    }
  }

  return results;
}

// ========================================
// TEST DE RLS (ROW LEVEL SECURITY)
// ========================================
export async function testRLSPolicies() {
  log('test', 'Probando políticas RLS...');

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      log('info', 'No hay usuario autenticado, saltando test de RLS');
      return { skipped: true };
    }

    const results: Record<string, boolean> = {};

    // Probar lectura en tablas con RLS
    const tablesWithRLS = ['expenses', 'categories', 'incomes', 'financials'];

    for (const table of tablesWithRLS) {
      try {
        const { data, error } = await supabase
          .from(table as any)
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          log('error', `RLS ${table}: ${error.message}`);
          results[table] = false;
        } else {
          log('success', `RLS ${table}: Funciona correctamente`);
          results[table] = true;
        }
      } catch (err) {
        log('error', `RLS ${table}: ${err instanceof Error ? err.message : String(err)}`);
        results[table] = false;
      }
    }

    return results;
  } catch (err) {
    log('error', `Error en test de RLS: ${err instanceof Error ? err.message : String(err)}`);
    return { error: true };
  }
}

// ========================================
// TEST DE TIEMPO REAL (REALTIME)
// ========================================
export async function testRealtimeSubscription() {
  log('test', 'Probando suscripciones en tiempo real...');

  return new Promise((resolve) => {
    try {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, (payload) => {
          log('success', `Evento en tiempo real recibido: ${payload.eventType}`);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            log('success', 'Suscripción en tiempo real exitosa');
            channel.unsubscribe();
            resolve(true);
          } else if (status === 'CHANNEL_ERROR') {
            log('error', 'Error en canal de tiempo real');
            resolve(false);
          }
        });

      // Timeout de 5 segundos
      setTimeout(() => {
        channel.unsubscribe();
        log('info', 'Timeout de suscripción en tiempo real');
        resolve(false);
      }, 5000);
    } catch (err) {
      log('error', `Error en tiempo real: ${err instanceof Error ? err.message : String(err)}`);
      resolve(false);
    }
  });
}

// ========================================
// EJECUTAR TODOS LOS TESTS
// ========================================
export async function runAllTests() {
  console.clear();
  log('test', '🚀 INICIANDO PRUEBAS DE ENDPOINTS');
  console.log('='.repeat(60));

  const results: any = {
    connection: false,
    auth: {},
    read: {},
    rls: {},
    realtime: false,
  };

  // 1. Test de conexión
  results.connection = await testSupabaseConnection();
  console.log('');

  if (!results.connection) {
    log('error', 'Conexión fallida. Deteniendo pruebas.');
    return results;
  }

  // 2. Test de autenticación
  results.auth = await testAuthEndpoints();
  console.log('');

  // 3. Test de lectura
  results.read = await testReadEndpoints();
  console.log('');

  // 4. Test de RLS
  results.rls = await testRLSPolicies();
  console.log('');

  // 5. Test de tiempo real
  results.realtime = await testRealtimeSubscription();
  console.log('');

  // Resumen
  console.log('='.repeat(60));
  log('test', '📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));

  const readSuccess = Object.values(results.read).filter(Boolean).length;
  const readTotal = Object.keys(results.read).length;

  console.log(`Conexión Supabase: ${results.connection ? '✅' : '❌'}`);
  console.log(`Autenticación: ${results.auth.getCurrentUser && results.auth.session ? '✅' : '⚠️'}`);
  console.log(`Endpoints de lectura: ${readSuccess}/${readTotal} exitosos`);
  console.log(`RLS: ${results.rls.skipped ? '⚠️ Saltado' : Object.keys(results.rls).length + ' políticas probadas'}`);
  console.log(`Tiempo real: ${results.realtime ? '✅' : '❌'}`);

  console.log('='.repeat(60));

  return results;
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testEndpoints = runAllTests;
  (window as any).testConnection = testSupabaseConnection;
  (window as any).testAuth = testAuthEndpoints;
  (window as any).testRead = testReadEndpoints;
  (window as any).testRLS = testRLSPolicies;
  (window as any).testRealtime = testRealtimeSubscription;
  (window as any).runSchemaDiagnostic = runSchemaDiagnostic;
  (window as any).generateFixSQL = generateFixSQL;

  console.log('%c🧪 Tests disponibles en consola:', 'color: #00ff00; font-size: 16px; font-weight: bold');
  console.log('%ctestEndpoints() - Ejecutar todos los tests', 'color: #00aaff; font-size: 14px');
  console.log('%ctestConnection() - Test de conexión', 'color: #00aaff; font-size: 14px');
  console.log('%ctestAuth() - Test de autenticación', 'color: #00aaff; font-size: 14px');
  console.log('%ctestRead() - Test de lectura', 'color: #00aaff; font-size: 14px');
  console.log('%ctestRLS() - Test de RLS', 'color: #00aaff; font-size: 14px');
  console.log('%ctestRealtime() - Test de tiempo real', 'color: #00aaff; font-size: 14px');
  console.log('%c🔍 runSchemaDiagnostic() - Diagnóstico de esquema BD', 'color: #ff9900; font-size: 14px');
}

