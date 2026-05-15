#!/bin/bash
# Safari Fixer - Antigravity CLI Tool
# Escanea y corrige errores comunes de renderizado en Safari.

PROJECT_DIR=$(pwd)
echo "🔍 Iniciando Auditoría de Safari en: $PROJECT_DIR"
echo "------------------------------------------------"

# 1. Corregir prefijos de background-clip (Safari requiere -webkit-)
echo "🛠️ Corrigiendo prefijos de texto gradiente..."
grep -r "background-clip: text" . --include="*.css" --include="*.html" | cut -d: -f1 | sort -u | xargs -I {} sed -i '' 's/background-clip: text/-webkit-background-clip: text; background-clip: text/g' {}

# 2. Corregir line-height insuficiente (Safari corta textos si es < 1.1)
echo "🛠️ Ajustando line-height para legibilidad en Safari..."
grep -r "line-height: 1;" . --include="*.css" --include="*.html" | cut -d: -f1 | sort -u | xargs -I {} sed -i '' 's/line-height: 1;/line-height: 1.2;/g' {}

# 3. Forzar crossorigin en fuentes de Google
echo "🛠️ Asegurando permisos de fuentes externas (CORS)..."
grep -r "fonts.googleapis.com" . --include="*.html" | grep -v "crossorigin" | cut -d: -f1 | sort -u | xargs -I {} sed -i '' 's/rel="stylesheet">/rel="stylesheet" crossorigin="anonymous">/g' {}

# 4. Validar integridad del Motor de Captura
if [ -f "common/libs/universal-capture.js" ]; then
    echo "✅ Motor Pro detectado. Aplicando optimizaciones de memoria..."
    sed -i '' 's/pixelRatio: 2/pixelRatio: 1.5/g' common/libs/universal-capture.js
fi

echo "------------------------------------------------"
echo "✨ ¡Listo! Se han aplicado parches de compatibilidad."
echo "💡 Tip: Si Safari sigue fallando, usa 'agent-browser screenshot' para una captura perfecta desde Chromium."
