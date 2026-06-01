#!/usr/bin/env bash
# APUESTA.IA — Verificador automático de resultados
# Se ejecuta vía cron después de cada partido
# Revisa fuentes web para obtener el marcador real y actualiza la DB

LOG="/tmp/apuestas-resultados.log"
DB="node /app/apuestas-db.js"

log() { echo "[$(date '+%Y-%m-%d %H:%M')] $1" | tee -a "$LOG"; }

log "=== Verificando resultados de partidos ==="

# ─── Verificar PSG vs Arsenal (Champions Final 11:00) ───────
log "Buscando resultado: PSG vs Arsenal..."
# Intentar obtener resultado desde múltiples fuentes
RESULTADO=$(curl -sL --max-time 8 "https://www.flashscore.com.mx/partido/" 2>/dev/null | grep -oiP 'PSG\s+\d+\s*-\s*\d+\s+Arsenal|Arsenal\s+\d+\s*-\s*\d+\s+PSG' | head -1)

if [ -n "$RESULTADO" ]; then
  log "Resultado encontrado: $RESULTADO"
  echo "$RESULTADO" | node -e "
    const fs = require('fs');
    const input = fs.readFileSync('/dev/stdin','utf-8').trim();
    const nums = input.match(/\\d+/g);
    if (nums && nums.length >= 2) {
      const db = require('./apuestas-db');
      const result = db.addResult('m_psg_ars', parseInt(nums[0]), parseInt(nums[1]));
      console.log('PSG vs Arsenal:', nums[0]+'-'+nums[1], '→', result.result);
    }
  " 2>&1 | tee -a "$LOG"
else
  log "No se encontró resultado para PSG vs Arsenal (quizás no terminó)"
fi

# ─── Verificar Toluca vs Tigres (CONCACAF Final 18:00) ──────
log "Buscando resultado: Toluca vs Tigres..."
RESULTADO=$(curl -sL --max-time 8 "https://www.flashscore.com.mx/partido/" 2>/dev/null | grep -oiP 'Toluca\s+\d+\s*-\s*\d+\s+Tigres|Tigres\s+\d+\s*-\s*\d+\s+Toluca' | head -1)

if [ -n "$RESULTADO" ]; then
  log "Resultado encontrado: $RESULTADO"
  echo "$RESULTADO" | node -e "
    const fs = require('fs');
    const input = fs.readFileSync('/dev/stdin','utf-8').trim();
    const nums = input.match(/\\d+/g);
    if (nums && nums.length >= 2) {
      const db = require('./apuestas-db');
      const result = db.addResult('m_tol_tig', parseInt(nums[0]), parseInt(nums[1]));
      console.log('Toluca vs Tigres:', nums[0]+'-'+nums[1], '→', result.result);
    }
  " 2>&1 | tee -a "$LOG"
else
  log "No se encontró resultado para Toluca vs Tigres"
fi

# Mostrar estado actual
$DB stats | tee -a "$LOG"
log "=== Verificación completada ==="