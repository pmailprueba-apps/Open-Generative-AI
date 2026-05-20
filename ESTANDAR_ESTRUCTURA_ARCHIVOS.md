# 📋 Estándar de Estructura de Archivos y Proyectos
*Ecosistema Antigravity — Versión 1.0 (Mayo 2026)*

Para asegurar que todos los proyectos en `/Users/macbook/Proyectos/` sean escalables y compatibles con agentes de IA, se establecen las siguientes reglas de organización obligatorias.

---

## 📂 1. Estructura de Carpetas por Proyecto
Cada proyecto (ej: `04-renta-montacargas`) debe mantener esta jerarquía:

### `/assets/` — Recursos Multimedia Brutos
- **Logos:** Versiones originales, variantes y archivos transparentes.
- **Imágenes:** Fotos de productos, fondos y texturas sin procesar.
- **Video/Audio:** Clips de video, archivos de voz (TTS) y música.
- **Fuentes:** Archivos `.woff2` o similares específicos del branding.

### `/marketing/` — Estrategia y Captación
- **Roadmap:** `INSTRUCCIONES.md` (Guía de ejecución del proyecto).
- **Copywriting:** Guiones de video, anuncios, secuencias de email y posts sociales.
- **Inteligencia:** `MASTER_KNOWLEDGE_SYNC.md` (Sincronización con el cerebro global).
- **Leads:** Bases de datos de prospectos y reportes de campañas.

### `/web/` o `/public/` — Código de Producción
- **HTML/CSS/JS:** Archivos base del sitio o aplicación.
- **Despliegue:** Carpeta raíz para hosting (ej: Firebase Hosting).
- **Versionado:** Los archivos estáticos deben usar versionado `?v=1.x` para evitar problemas de caché.

### `/promo-video/` — Producción Audiovisual
- **HyperFrames:** Archivos `index.html` de composiciones de video.
- **Renders:** Carpeta `.hyperframes/` para archivos temporales y finales.

---

## 🧠 2. Documentación de Contexto (.agents/)
Cada proyecto debe tener una carpeta oculta `.agents/` con:
1. **`product-marketing.md`**: El "Cerebro" del producto. Contiene el ICP, problemas, diferenciación y voz de marca.
2. **`skills/`**: Directorio de skills locales o enlaces simbólicos a la biblioteca global.

---

## 🛠️ 3. Reglas de Operación Global
1. **Manual Maestro:** Todo marketing debe respetar las leyes de `/_MASTER_KNOWLEDGE_/MANUAL_MAESTRO_MARKETING.md` (Fórmula A-C-P).
2. **Ganchos (Hooks):** Usar las plantillas de `/_MASTER_KNOWLEDGE_/GENERADOR_DE_GANCHOS.md`.
3. **Captura Visual:** No usar librerías externas para exportar imágenes desde HTML; usar siempre el motor estándar en `docs/ESTANDAR_CAPTURA_VISUAL.md`.
4. **Commits:** Realizar un commit/punto de restauración después de cada fase exitosa de diseño o lógica.
5. **SSOT (Single Source of Truth) para Obsidian:** ESTRICTAMENTE PROHIBIDO duplicar archivos de proyectos dentro del vault de Obsidian (`obsidean proyectos`). Todo proyecto debe permanecer en la raíz (`/Users/macbook/Proyectos/`). Para visualizarlos en Obsidian, usar SIEMPRE enlaces simbólicos (symlinks) en la carpeta `Adjuntos`: `ln -s /Users/macbook/Proyectos/[PROYECTO] "/Users/macbook/Proyectos/obsidean proyectos/0-Proyectos/Adjuntos/[PROYECTO]"`.

---

## 🚀 4. Lanzamiento de Nuevos Proyectos
Para iniciar un nuevo proyecto desde cero:
1. Usar el archivo `PLANTILLA.md` como base para el nuevo `INSTRUCCIONES.md`.
2. Ejecutar `./lanzador.sh [NUMERO]` para crear la estructura base.
3. Configurar inmediatamente el `.agents/product-marketing.md`.

---
*Este estándar es la ley en este workspace. Si no está en su lugar, el proyecto se considera en deuda técnica.*
