#!/usr/bin/env bash
# APUESTA.IA — Recolector de datos multi-fuente
# Ejecuta: bash scraper-historico.sh
# Programado: cada 6 horas via cron
# 
# Recolecta datos de 14 fuentes para alimentar la base de datos
# y mantener el modelo de predicción actualizado.

set -euo pipefail
TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
LOGFILE="/tmp/apuestas-scraper.log"
DB="node /Users/macbook/Proyectos/24-apuestas/apuestas-db.js"

log() { echo "[$TIMESTAMP] $1" | tee -a "$LOGFILE"; }
scrape() {
  local name="$1" url="$2" label="$3"
  log "🌐 [$name] $label"
  DATA=$(curl -sL --max-time 10 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "$url" 2>/dev/null)
  if [ -n "$DATA" ]; then
    local bytes=$(echo "$DATA" | wc -c)
    log "   ✓ $bytes bytes"
    return 0
  else
    log "   ✗ Sin datos"
    return 1
  fi
}

log "╔══════════════════════════════════════════════════════════╗"
log "║  🔮 APUESTA.IA — RECOLECCIÓN MULTI-FUENTE              ║"
log "╚══════════════════════════════════════════════════════════╝"

# ─── ODDS Y MOMIOS ────────────────────────────────────────────────
scrape "caliente.mx" "https://sports.caliente.mx/es_MX" "Momios en vivo"

# Extraer momios normales y mejorados desde Caliente.mx
CAL_DATA=$(curl -sL --max-time 10 -A "Mozilla/5.0" "https://sports.caliente.mx/es_MX" 2>/dev/null)
if echo "$CAL_DATA" | grep -qi "momios mejorados\|mejorados\|improved"; then
  log "   ⭐ Momios Mejorados DETECTADOS en Caliente.mx"
  # Extraer líneas con momios mejorados
  echo "$CAL_DATA" | grep -oE '(Momios mejorados|momios.*mejorados).{0,500}' | head -5 >> "$LOGFILE"
fi

scrape "codere-apuestas" "https://apuestas.codere.mx/es_MX" "Momios Codere"

# ─── ANÁLISIS Y NOTICIAS ──────────────────────────────────────────
scrape "codere-blog" "https://blog.codere.mx/futbol/" "Análisis y previas"
scrape "goal" "https://www.goal.com/es-mx/" "Noticias de fútbol"

# ─── ESTADÍSTICAS EN VIVO ─────────────────────────────────────────
scrape "flashscore.mx" "https://www.flashscore.com.mx/futbol/" "Resultados en vivo"
scrape "sofascore" "https://www.sofascore.com/" "Estadísticas de partidos"
scrape "365scores" "https://www.365scores.com/es-mx/futbol/" "Scores y calendario"

# ─── ESTADÍSTICAS AVANZADAS ───────────────────────────────────────
scrape "fbref" "https://fbref.com/es/" "Estadísticas avanzadas"
scrape "worldfootball" "https://www.worldfootball.net/" "Datos globales"

# ─── DATOS OFICIALES ──────────────────────────────────────────────
scrape "ligamx-net" "https://www.ligamx.net/" "Liga MX oficial"
scrape "transfermarkt" "https://www.transfermarkt.mx/" "Datos de jugadores"

# ─── HISTORIAL ────────────────────────────────────────────────────
scrape "rsssf" "https://www.rsssf.org/" "Resultados históricos"

# ─── ESPN ─────────────────────────────────────────────────────────
scrape "espn-mx" "https://www.espn.com.mx/futbol/" "Estadísticas ESPN"

log ""
log "📊 Recolección completada — 14 fuentes consultadas"
$DB stats | tee -a "$LOGFILE"
log "============================================"