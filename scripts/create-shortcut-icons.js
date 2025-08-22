#!/usr/bin/env node

// Script para crear iconos de shortcuts específicos
// Usar con: node scripts/create-shortcut-icons.js

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Configuración de shortcuts
const shortcuts = [
  {
    name: 'shortcut-expense.png',
    symbol: '💰',
    bgColor: '#ef4444', // Rojo para gastos
    description: 'Registrar Gasto'
  },
  {
    name: 'shortcut-dashboard.png', 
    symbol: '📊',
    bgColor: '#3b82f6', // Azul para dashboard
    description: 'Dashboard'
  },
  {
    name: 'shortcut-reports.png',
    symbol: '📈',
    bgColor: '#10b981', // Verde para reportes
    description: 'Reportes'
  }
];

// Función para crear SVG de shortcut
const createShortcutSVG = (symbol, bgColor, size = 96) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo circular -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${bgColor}"/>
  
  <!-- Símbolo -->
  <text x="${size/2}" y="${size/2 + size*0.1}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size*0.5}" dominant-baseline="central">${symbol}</text>
</svg>
`.trim();

// Función para convertir SVG a PNG
async function createShortcutIcon(shortcut) {
  try {
    const svgBuffer = Buffer.from(createShortcutSVG(shortcut.symbol, shortcut.bgColor));
    const outputPath = path.join(iconsDir, shortcut.name);
    
    await sharp(svgBuffer)
      .resize(96, 96)
      .png({
        quality: 95,
        compressionLevel: 9,
        progressive: true
      })
      .toFile(outputPath);
    
    console.log(`✅ Creado: ${shortcut.name} (${shortcut.description})`);
    return true;
  } catch (error) {
    console.error(`❌ Error creando ${shortcut.name}:`, error.message);
    return false;
  }
}

// Función principal
async function createAllShortcuts() {
  console.log('🔧 Creando iconos de shortcuts...');
  
  let created = 0;
  
  for (const shortcut of shortcuts) {
    const success = await createShortcutIcon(shortcut);
    if (success) created++;
  }
  
  console.log(`\n📊 Iconos de shortcuts creados: ${created}/${shortcuts.length}`);
  
  if (created === shortcuts.length) {
    console.log('🎉 ¡Todos los iconos de shortcuts fueron creados exitosamente!');
  }
}

// Ejecutar
createAllShortcuts().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
