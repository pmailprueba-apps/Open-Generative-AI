# Estándar de Captura Visual Aristeus & Antigravity

Este documento define el estándar obligatorio para la generación de imágenes HD desde archivos HTML en este espacio de trabajo, optimizado para Safari y Mac.

## 1. El Motor Pro
Se debe utilizar siempre la librería centralizada en `/common/libs/universal-capture.js`. 
Esta librería utiliza `html-to-image` (SVG Rasterization) en lugar de `html2canvas` para evitar los errores de opacidad y colores lavados en Safari.

## 2. Cómo Implementar en un Nuevo Archivo
Para que un archivo HTML tenga automáticamente la opción de descarga HD, debe seguir esta estructura:

### A. Definir el área de captura
El contenedor principal del diseño debe tener el ID `captureArea`:
```html
<div class="mi-diseno" id="captureArea">
    <!-- Contenido, fotos, texto -->
</div>
```

### B. Inyectar el script al final del <body>
```html
<script 
    src="../../common/libs/universal-capture.js" 
    data-target="#captureArea" 
    data-theme="#TU_COLOR_HEX" 
    data-filename="nombre_de_archivo.png">
</script>
```

## 3. Características del Sistema
- **Compatibilidad Safari:** Posee un sistema de reintento automático si la captura sale vacía.
- **Calidad de Impresión:** Renderiza a 3x de resolución por defecto.
- **Limpieza Automática:** Oculta barras de edición y botones antes de tomar la foto.
- **Vista Previa Premium:** Muestra una tarjeta con borde verde indicando "Imagen Pro Lista".

---
*Documento generado por Antigravity AI - 2026*
