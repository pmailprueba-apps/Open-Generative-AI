#!/bin/bash
# ==============================================================================
# 🔥 CLAUDE CODE - LANZADOR DE PROYECTOS
# ==============================================================================
# Uso: ./lanzador.sh [NUMERO_PROYECTO]
# Ejemplo: ./lanzador.sh 4
# ==============================================================================

PROYECTOS_DIR="/Users/macbook/Documents/BLENDER ANT/PROYECTOS"

declare PROYECTOS=(
  ["1"]="01-zurdo-norteno"
  ["2"]="02-venta-camaron"
  ["3"]="03-renta-equipo-sonido"
  ["4"]="04-renta-montacargas"
  ["5"]="05-incomparables-norteno"
)

if [ -z "$1" ] || [ ! -d "$PROYECTOS_DIR/${PROYECTOS[$1]}" ]; then
  echo ""
  echo "🔧 LANZADOR DE PROYECTOS - BLENDER ANT"
  echo "======================================="
  echo ""
  echo "Proyectos disponibles:"
  echo "  1 → Zurdo Norteño"
  echo "  2 → Venta Camarón"
  echo "  3 → Renta Equipo Sonido"
  echo "  4 → Renta Montacargas"
  echo "  5 → Los Incomparables"
  echo ""
  echo "Uso: $0 [NUMERO_PROYECTO]"
  echo "Ejemplo: $0 4"
  echo ""
  exit 1
fi

PROYECTO="${PROYECTOS[$1]}"
INSTRUCCIONES="$PROYECTOS_DIR/$PROYECTO/INSTRUCCIONES.md"

echo ""
echo "🚀 Iniciando proyecto: $PROYECTO"
echo "📄 Instrucciones: $INSTRUCCIONES"
echo ""

# Copiar al portapapeles el prompt de lanzamiento
PROMPT="Claude, inicia el proyecto \"$PROYECTO\" usando la plantilla de INSTRUCCIONES.md en $INSTRUCCIONES. Aplica los skills indicados, genera los prompts de ejemplo y devuelve la agenda de la Fase 1 con los entregables listos para revisión."

echo "$PROMPT" | pbcopy

echo "✅ Prompt copiado al portapapeles."
echo ""
echo "📋 Ahora abre Claude Code y pega el prompt (Cmd+V)"
echo ""
