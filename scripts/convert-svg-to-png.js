#!/usr/bin/env node

// Script para convertir iconos SVG a PNG con diferentes calidades
// Usar con: node scripts/convert-svg-to-png.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Opciones de calidad para PNG
const PNG_OPTIONS = {
  quality: 95,
  compressionLevel: 9,
  progressive: true,
  force: true
};

console.log('🔄 Iniciando conversión SVG → PNG...');

// Función para convertir SVG a PNG
async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png(PNG_OPTIONS)
      .toFile(pngPath);
    
    return true;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${svgPath}:`, error.message);
    return false;
  }
}

// Función principal
async function convertAllIcons() {
  if (!fs.existsSync(iconsDir)) {
    console.error('❌ Directorio de iconos no encontrado:', iconsDir);
    process.exit(1);
  }

  let convertedCount = 0;
  let failedCount = 0;

  for (const size of ICON_SIZES) {
    const svgFile = `icon-${size}x${size}.svg`;
    const pngFile = `icon-${size}x${size}.png`;
    
    const svgPath = path.join(iconsDir, svgFile);
    const pngPath = path.join(iconsDir, pngFile);

    if (!fs.existsSync(svgPath)) {
      console.warn(`⚠️  SVG no encontrado: ${svgFile}`);
      failedCount++;
      continue;
    }

    console.log(`🔄 Convirtiendo: ${svgFile} → ${pngFile}`);
    
    const success = await convertSvgToPng(svgPath, pngPath, size);
    
    if (success) {
      // Verificar tamaño del archivo generado
      const stats = fs.statSync(pngPath);
      const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
      
      console.log(`✅ Convertido: ${pngFile} (${sizeKB} KB)`);
      convertedCount++;
    } else {
      failedCount++;
    }
  }

  // Crear iconos adicionales requeridos para PWA
  await createAdditionalIcons();

  // Resumen
  console.log('\n📊 Resumen de conversión:');
  console.log(`✅ Convertidos exitosamente: ${convertedCount}`);
  console.log(`❌ Fallos: ${failedCount}`);
  console.log(`📁 Total archivos PNG: ${fs.readdirSync(iconsDir).filter(f => f.endsWith('.png')).length}`);
  
  if (convertedCount > 0) {
    console.log('\n🎉 ¡Conversión completada exitosamente!');
    showNextSteps();
  }
}

// Crear iconos adicionales específicos para PWA
async function createAdditionalIcons() {
  const additionalIcons = [
    { size: 180, name: 'apple-touch-icon.png', description: 'iOS Safari' },
    { size: 32, name: 'favicon-32x32.png', description: 'Favicon grande' },
    { size: 16, name: 'favicon-16x16.png', description: 'Favicon pequeño' },
    { size: 72, name: 'badge-72x72.png', description: 'Badge notificaciones' }
  ];

  console.log('\n🔧 Creando iconos adicionales...');

  for (const icon of additionalIcons) {
    const sourceSvg = path.join(iconsDir, `icon-${icon.size >= 180 ? 192 : icon.size}x${icon.size >= 180 ? 192 : icon.size}.svg`);
    const targetPng = path.join(iconsDir, icon.name);

    if (fs.existsSync(sourceSvg)) {
      const success = await convertSvgToPng(sourceSvg, targetPng, icon.size);
      if (success) {
        console.log(`✅ Creado: ${icon.name} (${icon.description})`);
      }
    }
  }
}

// Mostrar próximos pasos
function showNextSteps() {
  console.log('\n📋 Próximos pasos:');
  console.log('1. ✅ Los iconos PNG están listos para usar');
  console.log('2. 🔧 Actualizar manifest.json para usar PNG en lugar de SVG');
  console.log('3. 📱 Probar la instalación PWA en diferentes dispositivos');
  console.log('4. 🚀 Desplegar con: npm run deploy:pwa');
  console.log('\n💡 Tip: Los archivos PNG son más compatibles que SVG para PWA');
}

// Ejecutar conversión
convertAllIcons().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
