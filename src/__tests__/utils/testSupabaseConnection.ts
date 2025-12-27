/**
 * Script de diagnóstico para verificar la conexión a Supabase
 * y el flujo completo de datos de la aplicación
 * 
 * Ejecutar en la consola del navegador:
 * import('./utils/testSupabaseConnection.ts').then(m => m.runFullDiagnostic())
 */

import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  error?: any;
}

const results: DiagnosticResult[] = [];

function log(result: DiagnosticResult) {
  results.push(result);
  const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
  console.log(`${icon} [${result.test}] ${result.message}`);
  if (result.data) console.log('  Data:', result.data);
  if (result.error) console.error('  Error:', result.error);
}

/**
 * Test 1: Verificar configuración de Supabase
 */
async function testSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    log({
      test: 'Config',
      status: 'error',
      message: 'Variables de entorno no configuradas',
      error: { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
    });
    return false;
  }

  log({
    test: 'Config',
    status: 'success',
    message: 'Variables de entorno configuradas correctamente',
    data: { 
      url: supabaseUrl.substring(0, 30) + '...',
      hasKey: !!supabaseAnonKey 
    }
  });
  return true;
}

/**
 * Test 2: Verificar autenticación
 */
async function testAuthentication(): Promise<User | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      log({
        test: 'Auth',
        status: 'error',
        message: 'Error al obtener sesión',
        error
      });
      return null;
    }

    if (!session || !session.user) {
      log({
        test: 'Auth',
        status: 'warning',
        message: 'No hay usuario autenticado',
      });
      return null;
    }

    log({
      test: 'Auth',
      status: 'success',
      message: 'Usuario autenticado correctamente',
      data: {
        userId: session.user.id,
        email: session.user.email,
        provider: session.user.app_metadata?.provider
      }
    });

    return session.user;
  } catch (error) {
    log({
      test: 'Auth',
      status: 'error',
      message: 'Excepción al verificar autenticación',
      error
    });
    return null;
  }
}

/**
 * Test 3: Verificar perfil de usuario en public.users
 */
async function testUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      log({
        test: 'User Profile',
        status: 'error',
        message: 'Error al cargar perfil de usuario',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      });
      return false;
    }

    if (!data) {
      log({
        test: 'User Profile',
        status: 'error',
        message: 'Perfil de usuario no encontrado en public.users',
      });
      return false;
    }

    log({
      test: 'User Profile',
      status: 'success',
      message: 'Perfil de usuario cargado correctamente',
      data
    });
    return true;
  } catch (error) {
    log({
      test: 'User Profile',
      status: 'error',
      message: 'Excepción al cargar perfil',
      error
    });
    return false;
  }
}

/**
 * Test 4: Verificar categorías
 */
async function testCategories(userId: string) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      log({
        test: 'Categories',
        status: 'error',
        message: 'Error al cargar categorías',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      });
      return false;
    }

    log({
      test: 'Categories',
      status: data && data.length > 0 ? 'success' : 'warning',
      message: `${data?.length || 0} categorías encontradas`,
      data: data?.map(c => ({ id: c.id, name: c.name, icon: c.icon }))
    });
    return true;
  } catch (error) {
    log({
      test: 'Categories',
      status: 'error',
      message: 'Excepción al cargar categorías',
      error
    });
    return false;
  }
}

/**
 * Test 5: Verificar payment sources
 */
async function testPaymentSources(userId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_sources')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      log({
        test: 'Payment Sources',
        status: 'error',
        message: 'Error al cargar métodos de pago',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      });
      return false;
    }

    log({
      test: 'Payment Sources',
      status: data && data.length > 0 ? 'success' : 'warning',
      message: `${data?.length || 0} métodos de pago encontrados`,
      data: data?.map(ps => ({ id: ps.id, name: ps.name, type: ps.type }))
    });
    return true;
  } catch (error) {
    log({
      test: 'Payment Sources',
      status: 'error',
      message: 'Excepción al cargar payment sources',
      error
    });
    return false;
  }
}

/**
 * Test 6: Verificar gastos (expenses)
 */
async function testExpenses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .limit(5);

    if (error) {
      log({
        test: 'Expenses',
        status: 'error',
        message: 'Error al cargar gastos',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      });
      return false;
    }

    log({
      test: 'Expenses',
      status: 'success',
      message: `${data?.length || 0} gastos encontrados`,
      data: data?.map(e => ({ 
        id: e.id, 
        amount: e.amount, 
        description: e.description,
        date: e.date 
      }))
    });
    return true;
  } catch (error) {
    log({
      test: 'Expenses',
      status: 'error',
      message: 'Excepción al cargar gastos',
      error
    });
    return false;
  }
}

/**
 * Test 7: Verificar financials
 */
async function testFinancials(userId: string) {
  try {
    const { data, error } = await supabase
      .from('financials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      log({
        test: 'Financials',
        status: 'error',
        message: 'Error al cargar datos financieros',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      });
      return false;
    }

    log({
      test: 'Financials',
      status: data ? 'success' : 'warning',
      message: data ? 'Datos financieros cargados' : 'No hay datos financieros',
      data
    });
    return true;
  } catch (error) {
    log({
      test: 'Financials',
      status: 'error',
      message: 'Excepción al cargar financials',
      error
    });
    return false;
  }
}

/**
 * Test 8: Verificar RLS (Row Level Security)
 */
async function testRLSPolicies() {
  try {
    // Intentar acceder a datos sin filtro de user_id para ver si RLS está activo
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(10);

    const { data: allCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(10);

    log({
      test: 'RLS Policies',
      status: 'success',
      message: 'Verificación de políticas RLS',
      data: {
        canAccessUsers: !usersError,
        usersCount: allUsers?.length || 0,
        canAccessCategories: !categoriesError,
        categoriesCount: allCategories?.length || 0,
        note: 'Si ves más de 1 usuario o categorías de otros usuarios, RLS puede estar mal configurado'
      }
    });
    return true;
  } catch (error) {
    log({
      test: 'RLS Policies',
      status: 'error',
      message: 'Error al verificar políticas RLS',
      error
    });
    return false;
  }
}

/**
 * Test 9: Probar inserción de un gasto
 */
async function testInsertExpense(userId: string, categoryId?: string, paymentSourceId?: string) {
  try {
    const testExpense = {
      user_id: userId,
      amount: 10.50,
      description: 'Test de diagnóstico',
      category_id: categoryId || null,
      payment_source_id: paymentSourceId || null,
      date: new Date().toISOString(),
      notes: 'Este es un gasto de prueba creado por el diagnóstico'
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert(testExpense)
      .select()
      .single();

    if (error) {
      log({
        test: 'Insert Expense',
        status: 'error',
        message: 'Error al insertar gasto de prueba',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      });
      return null;
    }

    log({
      test: 'Insert Expense',
      status: 'success',
      message: 'Gasto de prueba insertado correctamente',
      data
    });

    return data;
  } catch (error) {
    log({
      test: 'Insert Expense',
      status: 'error',
      message: 'Excepción al insertar gasto',
      error
    });
    return null;
  }
}

/**
 * Test 10: Eliminar el gasto de prueba
 */
async function testDeleteExpense(userId: string, expenseId: string) {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) {
      log({
        test: 'Delete Expense',
        status: 'error',
        message: 'Error al eliminar gasto de prueba',
        error: {
          code: error.code,
          message: error.message
        }
      });
      return false;
    }

    log({
      test: 'Delete Expense',
      status: 'success',
      message: 'Gasto de prueba eliminado correctamente'
    });
    return true;
  } catch (error) {
    log({
      test: 'Delete Expense',
      status: 'error',
      message: 'Excepción al eliminar gasto',
      error
    });
    return false;
  }
}

/**
 * Ejecutar diagnóstico completo
 */
export async function runFullDiagnostic() {
  console.clear();
  console.log('🔍 ========================================');
  console.log('🔍 DIAGNÓSTICO COMPLETO - GASTOS HORMIGAS');
  console.log('🔍 ========================================\n');

  results.length = 0;

  // Test 1: Config
  const configOk = await testSupabaseConfig();
  if (!configOk) {
    console.log('\n❌ Configuración incorrecta. Revisar archivo .env');
    return results;
  }

  // Test 2: Auth
  const user = await testAuthentication();
  if (!user) {
    console.log('\n⚠️ No hay usuario autenticado. Por favor inicia sesión primero.');
    return results;
  }

  const userId = user.id;

  // Test 3-7: Datos del usuario
  await testUserProfile(userId);
  const categoriesData = await testCategories(userId);
  const paymentSourcesData = await testPaymentSources(userId);
  await testExpenses(userId);
  await testFinancials(userId);

  // Test 8: RLS
  await testRLSPolicies();

  // Test 9-10: CRUD (solo si hay categorías y payment sources)
  if (categoriesData && paymentSourcesData) {
    // Obtener primera categoría y payment source para el test
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    const { data: paymentSources } = await supabase
      .from('payment_sources')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    const categoryId = categories?.[0]?.id;
    const paymentSourceId = paymentSources?.[0]?.id;

    const testExpense = await testInsertExpense(userId, categoryId, paymentSourceId);
    if (testExpense) {
      await testDeleteExpense(userId, testExpense.id);
    }
  }

  // Resumen
  console.log('\n📊 ========================================');
  console.log('📊 RESUMEN DEL DIAGNÓSTICO');
  console.log('📊 ========================================\n');

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`⚠️ Advertencias: ${warningCount}`);
  console.log(`📝 Total de tests: ${results.length}\n`);

  if (errorCount > 0) {
    console.log('❌ PROBLEMAS DETECTADOS:');
    results
      .filter(r => r.status === 'error')
      .forEach(r => {
        console.log(`  - [${r.test}] ${r.message}`);
        if (r.error) console.log('    Error:', r.error);
      });
  }

  console.log('\n💡 Para ver los resultados detallados, revisa la variable "results" en la consola');
  console.log('💡 Ejecuta: window.diagnosticResults = results');

  // Guardar en window para fácil acceso
  (window as any).diagnosticResults = results;

  return results;
}

/**
 * Test rápido de conexión
 */
export async function quickTest() {
  console.log('⚡ Test rápido de conexión...\n');
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log('❌ No hay sesión activa');
    return;
  }

  console.log('✅ Sesión activa:', session.user.email);

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.log('❌ Error al cargar perfil:', error);
  } else {
    console.log('✅ Perfil cargado:', data);
  }
}
