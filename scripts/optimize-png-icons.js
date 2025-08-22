#!/usr/bin/env node

// Script para optimizar iconos PNG existentes
// Usar con: node scripts/optimize-png-icons.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Configuración de optimización agresiva
const OPTIMIZATION_CONFIG = {
  png: {
    quality: 90,           // Reducir calidad ligeramente para menor tamaño
    compressionLevel: 9,   // Máxima compresión
    progressive: true,     // Carga progresiva
    palette: true,         // Usar paleta de colores cuando sea posible
    effort: 10            // Máximo esfuerzo de optimización
  }
};

async function optimizePngIcon(filePath) {
  try {
    const originalStats = fs.statSync(filePath);
    const originalSize = originalStats.size;
    
    // Crear archivo temporal
    const tempPath = filePath + '.tmp';
    
    // Optimizar
    await sharp(filePath)
      .png(OPTIMIZATION_CONFIG.png)
      .toFile(tempPath);
    
    // Verificar si la optimización redujo el tamaño
    const optimizedStats = fs.statSync(tempPath);
    const optimizedSize = optimizedStats.size;
    
    if (optimizedSize < originalSize) {
      // Reemplazar el archivo original
      fs.renameSync(tempPath, filePath);
      
      const reduction = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
      const originalKB = Math.round(originalSize / 1024 * 100) / 100;
      const optimizedKB = Math.round(optimizedSize / 1024 * 100) / 100;
      
      console.log(`✅ Optimizado: ${path.basename(filePath)} (${originalKB}KB → ${optimizedKB}KB, -${reduction}%)`);
      
      return { success: true, originalSize, optimizedSize, reduction };
    } else {
      // Eliminar el archivo temporal si no hubo mejora
      fs.unlinkSync(tempPath);
      console.log(`⚪ Sin mejora: ${path.basename(filePath)} (${Math.round(originalSize / 1024 * 100) / 100}KB)`);
      
      return { success: false, originalSize, optimizedSize: originalSize, reduction: 0 };
    }
    
  } catch (error) {
    console.error(`❌ Error optimizando ${path.basename(filePath)}:`, error.message);
    return { success: false, originalSize: 0, optimizedSize: 0, reduction: 0 };
  }
}

async function optimizeAllPngIcons() {
  console.log('🔧 Optimizando iconos PNG...');
  
  if (!fs.existsSync(iconsDir)) {
    console.error('❌ Directorio de iconos no encontrado:', iconsDir);
    process.exit(1);
  }
  
  // Buscar todos los archivos PNG
  const pngFiles = fs.readdirSync(iconsDir)
    .filter(file => file.endsWith('.png'))
    .map(file => path.join(iconsDir, file));
  
  if (pngFiles.length === 0) {
    console.log('⚠️  No se encontraron archivos PNG para optimizar');
    return;
  }
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  let optimizedCount = 0;
  
  for (const filePath of pngFiles) {
    const result = await optimizePngIcon(filePath);
    
    totalOriginal += result.originalSize;
    totalOptimized += result.optimizedSize;
    
    if (result.success) {
      optimizedCount++;
    }
  }
  
  // Resumen
  const totalReduction = totalOriginal > 0 ? Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100) : 0;
  const totalOriginalKB = Math.round(totalOriginal / 1024 * 100) / 100;
  const totalOptimizedKB = Math.round(totalOptimized / 1024 * 100) / 100;
  
  console.log('\n📊 Resumen de optimización:');
  console.log(`📁 Archivos procesados: ${pngFiles.length}`);
  console.log(`✅ Archivos optimizados: ${optimizedCount}`);
  console.log(`💾 Tamaño original: ${totalOriginalKB} KB`);
  console.log(`💾 Tamaño optimizado: ${totalOptimizedKB} KB`);
  console.log(`📉 Reducción total: ${totalReduction}%`);
  
  if (optimizedCount > 0) {
    console.log('\n🎉 ¡Optimización completada!');
    console.log('💡 Los iconos optimizados cargan más rápido y usan menos ancho de banda');
  } else {
    console.log('\n✨ Los iconos ya estaban bien optimizados');
  }
}

// Ejecutar optimización
optimizeAllPngIcons().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
