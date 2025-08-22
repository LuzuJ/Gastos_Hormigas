#!/usr/bin/env node

/**
 * Script para optimizar imports no utilizados
 * Busca imports que no están siendo utilizados en el proyecto
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class ImportOptimizer {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
    this.unusedImports = [];
    this.results = {
      filesScanned: 0,
      unusedImports: 0,
      potentialSavings: 0
    };
  }

  async analyze() {
    console.log('🔍 Analizando imports no utilizados...\n');
    
    const files = await glob('**/*.{ts,tsx}', { cwd: this.srcDir });
    
    for (const file of files) {
      await this.analyzeFile(path.join(this.srcDir, file));
    }
    
    this.generateReport();
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.srcDir, filePath);
      
      this.results.filesScanned++;
      
      // Buscar imports
      const importRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?/g;
      const namedImportRegex = /import\s+(\w+)\s+from\s+['"][^'"]+['"];?/g;
      
      let match;
      
      // Analizar imports con destructuring
      while ((match = importRegex.exec(content)) !== null) {
        const imports = match[1].split(',').map(imp => imp.trim());
        
        for (const imp of imports) {
          const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim();
          if (!this.isImportUsed(content, cleanImport, match[0])) {
            this.unusedImports.push({
              file: relativePath,
              import: cleanImport,
              line: this.getLineNumber(content, match.index),
              fullImport: match[0]
            });
            this.results.unusedImports++;
          }
        }
      }
      
      // Analizar imports nombrados
      while ((match = namedImportRegex.exec(content)) !== null) {
        const importName = match[1];
        if (!this.isImportUsed(content, importName, match[0])) {
          this.unusedImports.push({
            file: relativePath,
            import: importName,
            line: this.getLineNumber(content, match.index),
            fullImport: match[0]
          });
          this.results.unusedImports++;
        }
      }
      
    } catch (error) {
      console.error(`❌ Error analizando ${filePath}:`, error.message);
    }
  }

  isImportUsed(content, importName, importStatement) {
    // Remover la línea del import para buscar en el resto del código
    const contentWithoutImport = content.replace(importStatement, '');
    
    // Buscar uso del import (excluir comentarios)
    const codeWithoutComments = contentWithoutImport
      .replace(/\/\*[\s\S]*?\*\//g, '') // Comentarios multilínea
      .replace(/\/\/.*$/gm, ''); // Comentarios de línea
    
    // Patrones para buscar uso del import
    const patterns = [
      new RegExp(`\\b${importName}\\b`, 'g'), // Uso directo
      new RegExp(`${importName}\\.`, 'g'), // Acceso a propiedades
      new RegExp(`<${importName}\\b`, 'g'), // Componente JSX
      new RegExp(`\\{${importName}\\b`, 'g'), // En object destructuring
    ];
    
    return patterns.some(pattern => pattern.test(codeWithoutComments));
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  generateReport() {
    console.log('📊 REPORTE DE OPTIMIZACIÓN DE IMPORTS\n');
    console.log(`Archivos escaneados: ${this.results.filesScanned}`);
    console.log(`Imports no utilizados encontrados: ${this.results.unusedImports}`);
    
    if (this.unusedImports.length > 0) {
      console.log('\n🗑️  IMPORTS NO UTILIZADOS:\n');
      
      // Agrupar por archivo
      const byFile = this.unusedImports.reduce((acc, item) => {
        if (!acc[item.file]) {
          acc[item.file] = [];
        }
        acc[item.file].push(item);
        return acc;
      }, {});
      
      Object.entries(byFile).forEach(([file, imports]) => {
        console.log(`📁 ${file}:`);
        imports.forEach(imp => {
          console.log(`   ❌ Línea ${imp.line}: ${imp.import}`);
        });
        console.log('');
      });
      
      console.log('💡 RECOMENDACIONES:');
      console.log('1. Revisa manualmente estos imports antes de removerlos');
      console.log('2. Algunos imports pueden ser utilizados en tipos TypeScript');
      console.log('3. Imports de side-effects pueden ser necesarios aunque no se usen directamente');
      console.log('4. Usa ESLint con reglas de imports no utilizados para prevención automática');
      
    } else {
      console.log('\n✅ ¡Excelente! No se encontraron imports no utilizados.');
    }
    
    // Guardar reporte
    const reportPath = path.join(process.cwd(), 'reports', 'import-optimization.json');
    this.saveReport(reportPath);
  }

  saveReport(reportPath) {
    try {
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const report = {
        timestamp: new Date().toISOString(),
        summary: this.results,
        unusedImports: this.unusedImports,
        recommendations: [
          'Configure ESLint rules for unused imports',
          'Use tree-shaking friendly imports',
          'Consider using dynamic imports for heavy libraries',
          'Regular import cleanup maintenance'
        ]
      };
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Reporte guardado en: ${reportPath}`);
      
    } catch (error) {
      console.error('❌ Error guardando reporte:', error.message);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const optimizer = new ImportOptimizer();
  optimizer.analyze().catch(error => {
    console.error('❌ Error ejecutando análisis:', error);
    process.exit(1);
  });
}

module.exports = ImportOptimizer;
