#!/usr/bin/env node

/**
 * Script de migración de datos de Firebase a Supabase
 * 
 * Este script migra datos de Firestore a PostgreSQL (Supabase)
 * 
 * Uso:
 * 1. Configura las variables de entorno para Firebase y Supabase
 * 2. Ejecuta: node scripts/migrate-firebase-to-supabase.js
 * 
 * Variables de entorno requeridas:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Clave de servicio (no anon key)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

// Inicializar clientes
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utilidades
const convertFirestoreTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

const logProgress = (message, count = null) => {
  const timestamp = new Date().toLocaleTimeString();
  const countText = count !== null ? ` (${count})` : '';
  console.log(`[${timestamp}] ${message}${countText}`);
};

// Función principal de migración
async function migrateData() {
  console.log('🚀 Iniciando migración de Firebase a Supabase...\n');

  try {
    // 1. Migrar usuarios
    await migrateUsers();
    
    // 2. Migrar categorías
    await migrateCategories();
    
    // 3. Migrar gastos
    await migrateExpenses();
    
    // 4. Migrar gastos fijos
    await migrateFixedExpenses();
    
    // 5. Migrar datos financieros
    await migrateFinancials();
    
    // 6. Migrar metas de ahorro
    await migrateSavingsGoals();
    
    // 7. Migrar activos
    await migrateAssets();
    
    // 8. Migrar pasivos
    await migrateLiabilities();
    
    console.log('\n✅ Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

async function migrateUsers() {
  logProgress('Migrando usuarios...');
  
  try {
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        display_name: data.displayName || 'Usuario',
        email: data.email || '',
        currency: data.currency || 'USD',
        created_at: convertFirestoreTimestamp(data.createdAt) || new Date().toISOString(),
        updated_at: convertFirestoreTimestamp(data.updatedAt) || new Date().toISOString(),
      });
    });
    
    if (users.length > 0) {
      const { error } = await supabase
        .from('users')
        .upsert(users, { onConflict: 'id' });
      
      if (error) throw error;
    }
    
    logProgress('✅ Usuarios migrados', users.length);
  } catch (error) {
    console.error('❌ Error migrando usuarios:', error);
    throw error;
  }
}

async function migrateCategories() {
  logProgress('Migrando categorías...');
  
  try {
    let totalCategories = 0;
    let totalSubcategories = 0;
    
    // Obtener todos los usuarios para recorrer sus categorías
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const categoriesSnapshot = await getDocs(
        collection(firestore, 'users', userId, 'categories')
      );
      
      const categories = [];
      const subcategories = [];
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        const categoryId = doc.id;
        
        // Añadir categoría
        categories.push({
          id: categoryId,
          user_id: userId,
          name: data.name,
          icon: data.icon || null,
          color: data.color || null,
          is_default: data.isDefault || false,
          budget: data.budget || null,
          created_at: convertFirestoreTimestamp(data.createdAt) || new Date().toISOString(),
          updated_at: convertFirestoreTimestamp(data.updatedAt) || new Date().toISOString(),
        });
        
        // Añadir subcategorías si existen
        if (data.subcategories && Array.isArray(data.subcategories)) {
          data.subcategories.forEach((sub) => {
            subcategories.push({
              id: sub.id,
              category_id: categoryId,
              name: sub.name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          });
        }
      });
      
      // Insertar categorías
      if (categories.length > 0) {
        const { error } = await supabase
          .from('categories')
          .upsert(categories, { onConflict: 'id' });
        
        if (error) throw error;
        totalCategories += categories.length;
      }
      
      // Insertar subcategorías
      if (subcategories.length > 0) {
        const { error } = await supabase
          .from('subcategories')
          .upsert(subcategories, { onConflict: 'id' });
        
        if (error) throw error;
        totalSubcategories += subcategories.length;
      }
    }
    
    logProgress('✅ Categorías migradas', totalCategories);
    logProgress('✅ Subcategorías migradas', totalSubcategories);
  } catch (error) {
    console.error('❌ Error migrando categorías:', error);
    throw error;
  }
}

async function migrateExpenses() {
  logProgress('Migrando gastos...');
  
  try {
    let totalExpenses = 0;
    
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const expensesSnapshot = await getDocs(
        collection(firestore, 'users', userId, 'expenses')
      );
      
      const expenses = [];
      
      expensesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        expenses.push({
          id: doc.id,
          user_id: userId,
          description: data.description,
          amount: data.amount,
          category_id: data.categoryId,
          sub_category: data.subCategory,
          payment_source_id: data.paymentSourceId || null,
          balance_after_transaction: data.balanceAfterTransaction || null,
          is_automatic: data.isAutomatic || false,
          parent_transaction_id: data.parentTransactionId || null,
          created_at: convertFirestoreTimestamp(data.createdAt) || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
      
      if (expenses.length > 0) {
        const { error } = await supabase
          .from('expenses')
          .upsert(expenses, { onConflict: 'id' });
        
        if (error) throw error;
        totalExpenses += expenses.length;
      }
    }
    
    logProgress('✅ Gastos migrados', totalExpenses);
  } catch (error) {
    console.error('❌ Error migrando gastos:', error);
    throw error;
  }
}

async function migrateFixedExpenses() {
  logProgress('Migrando gastos fijos...');
  
  try {
    let totalFixedExpenses = 0;
    
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const fixedExpensesSnapshot = await getDocs(
        collection(firestore, 'users', userId, 'fixedExpenses')
      );
      
      const fixedExpenses = [];
      
      fixedExpensesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        fixedExpenses.push({
          id: doc.id,
          user_id: userId,
          description: data.description,
          amount: data.amount,
          category: data.category,
          day_of_month: data.dayOfMonth,
          last_posted_month: data.lastPostedMonth || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
      
      if (fixedExpenses.length > 0) {
        const { error } = await supabase
          .from('fixed_expenses')
          .upsert(fixedExpenses, { onConflict: 'id' });
        
        if (error) throw error;
        totalFixedExpenses += fixedExpenses.length;
      }
    }
    
    logProgress('✅ Gastos fijos migrados', totalFixedExpenses);
  } catch (error) {
    console.error('❌ Error migrando gastos fijos:', error);
    throw error;
  }
}

async function migrateFinancials() {
  logProgress('Migrando datos financieros...');
  
  try {
    let totalFinancials = 0;
    
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const financialsSnapshot = await getDocs(
        collection(firestore, 'users', userId, 'financials')
      );
      
      // En Firebase, financials suele tener un documento 'summary'
      const summaryDoc = financialsSnapshot.docs.find(doc => doc.id === 'summary');
      
      if (summaryDoc) {
        const data = summaryDoc.data();
        
        const financial = {
          user_id: userId,
          monthly_income: data.monthlyIncome || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('financials')
          .upsert([financial], { onConflict: 'user_id' });
        
        if (error) throw error;
        totalFinancials++;
      }
    }
    
    logProgress('✅ Datos financieros migrados', totalFinancials);
  } catch (error) {
    console.error('❌ Error migrando datos financieros:', error);
    throw error;
  }
}

async function migrateSavingsGoals() {
  logProgress('Migrando metas de ahorro...');
  
  try {
    let totalGoals = 0;
    
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const goalsSnapshot = await getDocs(
        collection(firestore, 'users', userId, 'savingsGoals')
      );
      
      const goals = [];
      
      goalsSnapshot.forEach((doc) => {
        const data = doc.data();
        
        goals.push({
          id: doc.id,
          user_id: userId,
          name: data.name,
          target_amount: data.targetAmount,
          current_amount: data.currentAmount || 0,
          created_at: convertFirestoreTimestamp(data.createdAt) || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
      
      if (goals.length > 0) {
        const { error } = await supabase
          .from('savings_goals')
          .upsert(goals, { onConflict: 'id' });
        
        if (error) throw error;
        totalGoals += goals.length;
      }
    }
    
    logProgress('✅ Metas de ahorro migradas', totalGoals);
  } catch (error) {
    console.error('❌ Error migrando metas de ahorro:', error);
    throw error;
  }
}

async function migrateAssets() {
  logProgress('Migrando activos...');
  
  try {
    let totalAssets = 0;
    
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const assetsSnapshot = await getDocs(
        collection(firestore, 'users', userId, 'assets')
      );
      
      const assets = [];
      
      assetsSnapshot.forEach((doc) => {
        const data = doc.data();
        
        assets.push({
          id: doc.id,
          user_id: userId,
          name: data.name,
          value: data.value,
          type: data.type,
          description: data.description || null,
          created_at: convertFirestoreTimestamp(data.lastUpdated) || new Date().toISOString(),
          updated_at: convertFirestoreTimestamp(data.lastUpdated) || new Date().toISOString(),
        });
      });
      
      if (assets.length > 0) {
        const { error } = await supabase
          .from('assets')
          .upsert(assets, { onConflict: 'id' });
        
        if (error) throw error;
        totalAssets += assets.length;
      }
    }
    
    logProgress('✅ Activos migrados', totalAssets);
  } catch (error) {
    console.error('❌ Error migrando activos:', error);
    throw error;
  }
}

async function migrateLiabilities() {
  logProgress('Migrando pasivos...');
  
  try {
    let totalLiabilities = 0;
    
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const liabilitiesSnapshot = await getDocs(
        collection(firestore, 'users', userId, 'liabilities')
      );
      
      const liabilities = [];
      
      liabilitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        liabilities.push({
          id: doc.id,
          user_id: userId,
          name: data.name,
          amount: data.amount,
          original_amount: data.originalAmount || null,
          type: data.type,
          interest_rate: data.interestRate || null,
          monthly_payment: data.monthlyPayment || null,
          duration: data.duration || null,
          due_date: data.dueDate || null,
          description: data.description || null,
          is_archived: data.isArchived || false,
          archived_at: convertFirestoreTimestamp(data.archivedAt) || null,
          created_at: convertFirestoreTimestamp(data.lastUpdated) || new Date().toISOString(),
          updated_at: convertFirestoreTimestamp(data.lastUpdated) || new Date().toISOString(),
        });
      });
      
      if (liabilities.length > 0) {
        const { error } = await supabase
          .from('liabilities')
          .upsert(liabilities, { onConflict: 'id' });
        
        if (error) throw error;
        totalLiabilities += liabilities.length;
      }
    }
    
    logProgress('✅ Pasivos migrados', totalLiabilities);
  } catch (error) {
    console.error('❌ Error migrando pasivos:', error);
    throw error;
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData().catch(console.error);
}
