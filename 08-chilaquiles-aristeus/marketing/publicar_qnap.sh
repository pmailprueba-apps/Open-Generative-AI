#!/bin/bash
# ============================================================
# PUBLICADOR AUTOMÁTICO - Chilaquiles Aristeus
# Para QNAP (192.168.100.10) o cualquier servidor Linux
# ============================================================
# Copiar a QNAP en: /share/CACHEDEV1_DATA/aristeus-publisher/
# Agregar al CRON:
#   0 12 * * * /share/CACHEDEV1_DATA/aristeus-publisher/publicar_qnap.sh 12
#   0 15 * * * /share/CACHEDEV1_DATA/aristeus-publisher/publicar_qnap.sh 15
# ============================================================

PROYECTO="/share/CACHEDEV1_DATA/aristeus-publisher"
cd "$PROYECTO" || exit 1

HORA=$1  # 12 o 15

# Día actual en español
DIAS=("Domingo" "Lunes" "Martes" "Miércoles" "Jueves" "Viernes" "Sábado")
DIA=${DIAS[$(date +%w)]}

# Seleccionar imagen: 12:00=primera, 15:00=segunda
IDX=0
[ "$HORA" = "15" ] && IDX=1

IMAGEN=$(ls ./contenido/"$DIA"/*.png ./contenido/"$DIA"/*.jpg 2>/dev/null | sort | sed -n "$((IDX+1))p")

if [ -z "$IMAGEN" ]; then
  echo "❌ Sin imagen para $DIA $HORA:00"
  exit 1
fi

# Extraer copy del calendario
COPY=$(node -e "
const c = require('./calendario.json');
const d = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const hoy = d[new Date().getDay()];
const idx = process.argv[1] === '15' ? 1 : 0;
console.log(c.dias[hoy]?.[idx]?.copy || '🍽️ ' + hoy + ' de Aristëus — Ruta 57');
" "$HORA")

echo "📅 $DIA $HORA:00 — Publicando..."
echo "📸 $IMAGEN"
echo "📝 $COPY"

# Publicar
node post.js "$COPY" "$IMAGEN"
echo "✅ Listo"
