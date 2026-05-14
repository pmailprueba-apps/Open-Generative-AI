# 🛡️ Chilaquiles Aristeus — Guía de Identidad y Reglas de Diseño [v4.0]

Esta guía documenta todas las reglas estéticas, técnicas y de marca establecidas para el menú digital **Ultra Premium**.

## 1. Fundamentos Visuales (Tokens de Diseño)
*   **Colores:**
    *   `--deep-navy`: `#0f172a` (Fondo principal profundo).
    *   `--harvest-gold`: `#c9a96e` (Acentos, iconos y degradados metálicos).
    *   `--artisan-cream`: `#faf6f0` (Textos secundarios y crema).
    *   `--chile-red`: `#c0392b` (Acentos de pasión/picante).
*   **Tipografía:**
    *   **Títulos:** `DM Serif Display` (Elegancia clásica/industrial).
    *   **Cuerpo/Datos:** `Outfit` (Modernidad y legibilidad en carretera).

## 2. Reglas de Branding y Logotipos
*   **Logo Principal [0.0]:** Centrado en el Hero, con animación de flotación suave y sombra profunda.
*   **Logo de Acero [0.1]:** Reemplaza el texto "Parada de Leyenda". Debe estar pegado al título "RUTA 57" para formar un bloque compacto.
*   **Marca de Agua Lateral:** El logo de Aristeus debe aparecer en el margen izquierdo con posición `fixed`, baja opacidad (`0.15`) y una rotación de `-5deg` para crear profundidad visual (Efecto "Ruta 57").

## 3. Estética de Títulos y Secciones
*   **Efecto Metálico:** Todos los títulos de sección (`h2`) y nombres de platillos destacados deben usar un degradado lineal: `linear-gradient(to bottom, #fff, var(--harvest-gold))`.
*   **Sombra de Texto:** Aplicar `drop-shadow(0 10px 20px rgba(0,0,0,0.3))` para que el texto resalte sobre el fondo oscuro.
*   **Separadores:** Usar el diamante dorado `✦` debajo de los títulos de sección.

## 4. Footer (Pie de Página)
*   **Layout:** Estructura compacta de 3 columnas (QR Izquierda | Espacio Central | Info Derecha).
*   **Logo de Fondo:** Una "A" de Aristeus centrada detrás de toda la información del footer (`z-index: 0`, `opacity: 0.15`).
*   **Iconografía:** Uso obligatorio de **FontAwesome** para redes sociales (Facebook, Instagram, TikTok) y datos de contacto.

## 5. Reglas Técnicas de Edición
*   **Modo Editable:** Todos los textos deben mantener el atributo `contenteditable="true"` para permitir cambios rápidos.
*   **Sistema de IDs:** Mantener la nomenclatura `[X.Y]` (ej: [1.0] para la primera sección) para facilitar la referencia rápida durante el desarrollo.

## 6. Gestión de Activos (Assets)
*   Las imágenes de productos deben llevar la clase `.item-img` con bordes redondeados y sombra.
*   Cualquier imagen nueva debe pasar por un proceso de limpieza de fondo (transparencia PNG) para no romper la estética de "capas" del menú.

---
*Última actualización: 12 de Mayo, 2026*
