#!/usr/bin/env node

// Script para generar iconos PWA desde una imagen base
// Usar con: node scripts/generate-icons.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamaños de iconos requeridos para PWA
const ICON_SIZES = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// Plantilla SVG básica (reemplazar con tu diseño)
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo circular -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#3b82f6"/>
  
  <!-- Hormiga estilizada -->
  <g transform="translate(${size*0.25},${size*0.25}) scale(${size*0.5/100})">
    <!-- Cuerpo de la hormiga -->
    <ellipse cx="50" cy="40" rx="15" ry="25" fill="white"/>
    <ellipse cx="50" cy="70" rx="12" ry="20" fill="white"/>
    
    <!-- Cabeza -->
    <circle cx="50" cy="20" r="12" fill="white"/>
    
    <!-- Antenas -->
    <line x1="45" y1="12" x2="40" y2="5" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="55" y1="12" x2="60" y2="5" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <circle cx="40" cy="5" r="2" fill="white"/>
    <circle cx="60" cy="5" r="2" fill="white"/>
    
    <!-- Patas -->
    <line x1="40" y1="45" x2="25" y2="50" stroke="white" stroke-width="2"/>
    <line x1="60" y1="45" x2="75" y2="50" stroke="white" stroke-width="2"/>
    <line x1="40" y1="55" x2="25" y2="65" stroke="white" stroke-width="2"/>
    <line x1="60" y1="55" x2="75" y2="65" stroke="white" stroke-width="2"/>
    <line x1="45" y1="75" x2="35" y2="85" stroke="white" stroke-width="2"/>
    <line x1="55" y1="75" x2="65" y2="85" stroke="white" stroke-width="2"/>
    
    <!-- Símbolo de dinero -->
    <text x="50" y="95" text-anchor="middle" fill="#10b981" font-family="Arial, sans-serif" font-size="16" font-weight="bold">$</text>
  </g>
</svg>
`.trim();

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generando iconos PWA...');

// Generar iconos SVG para cada tamaño
ICON_SIZES.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generado: ${filename}`);
});

// Crear archivo README para los iconos
const iconReadme = `# Iconos PWA - Gastos Hormigas

Este directorio contiene los iconos necesarios para que la aplicación funcione como PWA.

## Iconos Generados

${ICON_SIZES.map(size => `- icon-${size}x${size}.svg (${size}x${size}px)`).join('\n')}

## Conversión a PNG

Para obtener mejor compatibilidad, convierte los SVG a PNG usando una herramienta como:

- [Squoosh](https://squoosh.app/) - Online
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimización SVG
- ImageMagick (CLI): \`convert icon.svg -resize 192x192 icon-192x192.png\`

## Tamaños Requeridos

- **16x16, 32x32**: Favicon
- **72x72, 96x96, 128x128, 144x144**: Android Chrome
- **152x152**: iOS Safari
- **192x192, 384x384, 512x512**: PWA Standard

## Uso

Los iconos se referencian automáticamente desde:
- \`manifest.json\`
- \`index.html\` (meta tags)
- Service Worker para notificaciones
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), iconReadme);

console.log('📝 Creado README.md para iconos');
console.log('🎉 ¡Iconos PWA generados exitosamente!');
console.log('');
console.log('📋 Próximos pasos:');
console.log('1. Convierte los SVG a PNG para mejor compatibilidad');
console.log('2. Optimiza los PNG para reducir tamaño');
console.log('3. Testa la instalación PWA en diferentes dispositivos');
console.log('4. Configura screenshots para el manifest.json');
