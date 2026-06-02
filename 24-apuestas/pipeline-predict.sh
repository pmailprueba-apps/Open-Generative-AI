#!/usr/bin/env bash
# APUESTA.IA — Pipeline Predictivo Automático End-to-End
# Uso: ./pipeline-predict.sh "Toluca" "Tigres" "1.80,3.50,4.20"

set -euo pipefail

MATCH_HOME="${1:-Toluca}"
MATCH_AWAY="${2:-Tigres}"
ODDS="${3:-}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "==========================================================="
echo "🔮 APUESTA.IA — PIPELINE AUTÓNOMO: $MATCH_HOME vs $MATCH_AWAY"
echo "==========================================================="

# ─── FASE 1: SCOUT (Extracción de API Real) ──────────────────────
echo "[1/3] Ejecutando SCOUT_AGENT (API-Football)..."
rm -f ultimas-estadisticas.json  # Clean slate for each run
node scout-estadisticas.js "$MATCH_HOME" "$MATCH_AWAY"

if [ ! -f "ultimas-estadisticas.json" ]; then
    echo "❌ Error: El Scout no pudo obtener datos o generar el archivo."
    exit 1
fi

# Extraer datos reales generados por el Scout
HOME_NAME=$(jq -r '.home' ultimas-estadisticas.json)
AWAY_NAME=$(jq -r '.away' ultimas-estadisticas.json)
HOME_ELO=$(jq -r '.homeELO' ultimas-estadisticas.json)
AWAY_ELO=$(jq -r '.awayELO' ultimas-estadisticas.json)
HOME_FORM=$(jq -c '.homeForm' ultimas-estadisticas.json)
AWAY_FORM=$(jq -c '.awayForm' ultimas-estadisticas.json)
H2H=$(jq -c '.h2h' ultimas-estadisticas.json)

echo "✓ Datos reales obtenidos: ELO Local=$HOME_ELO, ELO Visita=$AWAY_ELO"

# ─── FASE 2: CONSTRUCCIÓN DE PARÁMETROS PARA EL PREDICTOR ───────
echo "[2/3] Preparando parámetros para Predictor Engine..."

PREDICTOR_ARGS=(
    "--home" "$HOME_NAME"
    "--away" "$AWAY_NAME"
    "--home-elo" "$HOME_ELO"
    "--away-elo" "$AWAY_ELO"
    "--home-form" "$HOME_FORM"
    "--away-form" "$AWAY_FORM"
    "--h2h" "$H2H"
)

# Parsear momios si el usuario los proveyó (Ej: "1.80,3.50,4.20")
if [ -n "$ODDS" ]; then
    H_ODD=$(echo "$ODDS" | cut -d',' -f1)
    D_ODD=$(echo "$ODDS" | cut -d',' -f2)
    A_ODD=$(echo "$ODDS" | cut -d',' -f3)
    # Formatear el JSON esperado por predictor-engine.js
    ODDS_JSON="{\"caliente\":{\"home\":$H_ODD,\"draw\":$D_ODD,\"away\":$A_ODD}}"
    PREDICTOR_ARGS+=("--odds" "$ODDS_JSON")
    echo "✓ Momios inyectados: Local $H_ODD | Empate $D_ODD | Visita $A_ODD"
else
    echo "⚠️ No se proveyeron momios, el EV+ no se calculará."
fi

# ─── FASE 3: PREDICTOR MATEMÁTICO ────────────────────────────────
echo "[3/3] Ejecutando PREDICTOR_AGENT (Dixon-Coles + Kelly)..."
echo ""

# Ejecutar el motor de predicción y guardar salida limpia
node predictor-engine.js "${PREDICTOR_ARGS[@]}"

echo "==========================================================="
echo "✅ Pipeline completado."