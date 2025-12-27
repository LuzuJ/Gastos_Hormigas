/**
 * Script de Diagnóstico de Esquema de Base de Datos
 * 
 * Este script compara el esquema real de Supabase con los tipos TypeScript definidos
 * para identificar inconsistencias y errores.
 * 
 * Uso: Ejecutar en la consola del navegador o importar en la aplicación
 */

import { supabase } from '../config/supabase';

// Tipos esperados según database.ts
const EXPECTED_SCHEMA = {
    users: {
        columns: ['id', 'email', 'display_name', 'avatar_url', 'theme', 'currency', 'language', 'created_at', 'updated_at'],
        required: ['id', 'display_name', 'currency', 'created_at', 'updated_at']
    },
    categories: {
        columns: ['id', 'user_id', 'name', 'icon', 'color', 'is_default', 'budget', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'name', 'is_default', 'created_at', 'updated_at']
    },
    subcategories: {
        columns: ['id', 'category_id', 'name', 'created_at', 'updated_at'],
        required: ['id', 'category_id', 'name', 'created_at', 'updated_at']
    },
    payment_sources: {
        columns: ['id', 'user_id', 'name', 'type', 'balance', 'description', 'is_active', 'icon', 'color', 'auto_update', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'name', 'type', 'balance', 'is_active', 'auto_update', 'created_at', 'updated_at']
    },
    expenses: {
        columns: ['id', 'user_id', 'description', 'amount', 'category_id', 'subcategory_id', 'payment_source_id', 'date', 'notes', 'is_fixed', 'tags', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'description', 'amount', 'category_id']
    },
    fixed_expenses: {
        columns: ['id', 'user_id', 'description', 'amount', 'category', 'day_of_month', 'last_posted_month', 'is_active', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'description', 'amount', 'category', 'day_of_month', 'is_active']
    },
    financials: {
        columns: ['id', 'user_id', 'monthly_income', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'monthly_income']
    },
    savings_goals: {
        columns: ['id', 'user_id', 'name', 'target_amount', 'current_amount', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'name', 'target_amount', 'current_amount']
    },
    assets: {
        columns: ['id', 'user_id', 'name', 'value', 'type', 'description', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'name', 'value', 'type']
    },
    liabilities: {
        columns: ['id', 'user_id', 'name', 'amount', 'original_amount', 'type', 'interest_rate', 'monthly_payment', 'duration', 'due_date', 'description', 'is_archived', 'archived_at', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'name', 'amount', 'type', 'is_archived']
    },
    incomes: {
        columns: ['id', 'user_id', 'amount', 'description', 'category', 'asset_id', 'asset_name', 'date', 'is_recurring', 'recurrence_frequency', 'recurrence_day', 'next_recurrence_date', 'created_at', 'updated_at'],
        required: ['id', 'user_id', 'amount', 'description', 'category', 'date', 'is_recurring']
    },
    achievements: {
        columns: ['id', 'user_id', 'achievement_type', 'achieved_at', 'created_at'],
        required: ['id', 'user_id', 'achievement_type']
    }
};

interface ColumnInfo {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
}

interface TableDiagnostic {
    tableName: string;
    exists: boolean;
    actualColumns: string[];
    expectedColumns: string[];
    missingColumns: string[];
    extraColumns: string[];
    errors: string[];
}

interface DiagnosticReport {
    timestamp: string;
    totalTables: number;
    tablesFound: number;
    tablesMissing: number;
    totalIssues: number;
    tables: TableDiagnostic[];
    summary: string;
}

/**
 * Obtiene el esquema real de una tabla desde Supabase
 * Nota: Esta función es un fallback, el método principal es getColumnsFromQuery
 */
async function getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    // Intentar obtener información del schema
    // Nota: information_schema no es accesible desde el cliente normalmente
    console.log(`[getTableSchema] Intentando obtener esquema de ${tableName}`);
    return [];
}

/**
 * Verifica si una tabla existe probando una consulta simple
 */
async function tableExists(tableName: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);

        // Si no hay error o el error no es "tabla no existe", la tabla existe
        if (!error) return true;
        if (error.code === '42P01') return false; // Table does not exist
        return true; // Otros errores (como RLS) significan que la tabla existe
    } catch {
        return false;
    }
}

/**
 * Intenta obtener columnas de una tabla mediante una consulta
 */
async function getColumnsFromQuery(tableName: string): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            console.log(`[${tableName}] Error consultando: ${error.message}`);
            return [];
        }

        if (data && data.length > 0) {
            return Object.keys(data[0]);
        }

        // Si no hay datos, la tabla existe pero está vacía
        return [];
    } catch (e) {
        console.log(`[${tableName}] Excepción: ${e}`);
        return [];
    }
}

/**
 * Realiza el diagnóstico completo del esquema
 */
export async function runSchemaDiagnostic(): Promise<DiagnosticReport> {
    console.log('🔍 Iniciando diagnóstico de esquema de base de datos...\n');

    const report: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        totalTables: Object.keys(EXPECTED_SCHEMA).length,
        tablesFound: 0,
        tablesMissing: 0,
        totalIssues: 0,
        tables: [],
        summary: ''
    };

    for (const [tableName, expected] of Object.entries(EXPECTED_SCHEMA)) {
        console.log(`📋 Verificando tabla: ${tableName}...`);

        const diagnostic: TableDiagnostic = {
            tableName,
            exists: false,
            actualColumns: [],
            expectedColumns: expected.columns,
            missingColumns: [],
            extraColumns: [],
            errors: []
        };

        // Verificar si la tabla existe
        const exists = await tableExists(tableName);
        diagnostic.exists = exists;

        if (!exists) {
            diagnostic.errors.push(`❌ TABLA NO EXISTE: ${tableName}`);
            report.tablesMissing++;
            report.totalIssues++;
            console.log(`  ❌ Tabla no existe`);
        } else {
            report.tablesFound++;

            // Obtener columnas reales
            const actualColumns = await getColumnsFromQuery(tableName);
            diagnostic.actualColumns = actualColumns;

            if (actualColumns.length === 0) {
                diagnostic.errors.push(`⚠️ No se pudieron obtener columnas (tabla vacía o sin permisos)`);
                console.log(`  ⚠️ Tabla vacía o sin permisos para ver estructura`);
            } else {
                // Comparar columnas
                const missingColumns = expected.columns.filter(col => !actualColumns.includes(col));
                const extraColumns = actualColumns.filter(col => !expected.columns.includes(col));

                diagnostic.missingColumns = missingColumns;
                diagnostic.extraColumns = extraColumns;

                if (missingColumns.length > 0) {
                    diagnostic.errors.push(`❌ Columnas faltantes: ${missingColumns.join(', ')}`);
                    report.totalIssues += missingColumns.length;
                    console.log(`  ❌ Columnas faltantes: ${missingColumns.join(', ')}`);
                }

                if (extraColumns.length > 0) {
                    console.log(`  ℹ️ Columnas extra (no en tipos): ${extraColumns.join(', ')}`);
                }

                if (missingColumns.length === 0) {
                    console.log(`  ✅ OK - todas las columnas presentes`);
                }
            }
        }

        report.tables.push(diagnostic);
    }

    // Generar resumen
    const issues = report.tables.filter(t => t.errors.length > 0);
    report.summary = `
═══════════════════════════════════════════════════════════════
                 REPORTE DE DIAGNÓSTICO DE ESQUEMA
═══════════════════════════════════════════════════════════════

📊 RESUMEN:
   • Tablas esperadas: ${report.totalTables}
   • Tablas encontradas: ${report.tablesFound}
   • Tablas faltantes: ${report.tablesMissing}
   • Total de issues: ${report.totalIssues}

${issues.length > 0 ? `
❌ TABLAS CON PROBLEMAS:
${issues.map(t => `   • ${t.tableName}: ${t.errors.join(', ')}`).join('\n')}
` : '✅ TODAS LAS TABLAS ESTÁN CORRECTAS'}

═══════════════════════════════════════════════════════════════
`;

    console.log(report.summary);

    return report;
}

/**
 * Genera SQL para corregir los problemas encontrados
 */
export function generateFixSQL(report: DiagnosticReport): string {
    let sql = '-- SQL para corregir inconsistencias de esquema\n';
    sql += '-- Generado automáticamente por el diagnóstico\n\n';

    for (const table of report.tables) {
        if (!table.exists) {
            sql += `-- TODO: Crear tabla ${table.tableName}\n`;
            sql += `-- CREATE TABLE public.${table.tableName} (...);\n\n`;
        } else if (table.missingColumns.length > 0) {
            sql += `-- Agregar columnas faltantes a ${table.tableName}\n`;
            for (const col of table.missingColumns) {
                sql += `-- ALTER TABLE public.${table.tableName} ADD COLUMN ${col} <tipo> <constraints>;\n`;
            }
            sql += '\n';
        }
    }

    return sql;
}

// Exportar para usar en consola
if (typeof window !== 'undefined') {
    (window as any).runSchemaDiagnostic = runSchemaDiagnostic;
    (window as any).generateFixSQL = generateFixSQL;
}

export default { runSchemaDiagnostic, generateFixSQL, EXPECTED_SCHEMA };
