# Iconos PWA - Gastos Hormigas

Este directorio contiene los iconos necesarios para que la aplicación funcione como PWA.

## Iconos Generados

- icon-16x16.svg (16x16px)
- icon-32x32.svg (32x32px)
- icon-72x72.svg (72x72px)
- icon-96x96.svg (96x96px)
- icon-128x128.svg (128x128px)
- icon-144x144.svg (144x144px)
- icon-152x152.svg (152x152px)
- icon-192x192.svg (192x192px)
- icon-384x384.svg (384x384px)
- icon-512x512.svg (512x512px)

## Conversión a PNG

Para obtener mejor compatibilidad, convierte los SVG a PNG usando una herramienta como:

- [Squoosh](https://squoosh.app/) - Online
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimización SVG
- ImageMagick (CLI): `convert icon.svg -resize 192x192 icon-192x192.png`

## Tamaños Requeridos

- **16x16, 32x32**: Favicon
- **72x72, 96x96, 128x128, 144x144**: Android Chrome
- **152x152**: iOS Safari
- **192x192, 384x384, 512x512**: PWA Standard

## Uso

Los iconos se referencian automáticamente desde:
- `manifest.json`
- `index.html` (meta tags)
- Service Worker para notificaciones
