#!/usr/bin/env bash
# APUESTA.IA — Consulta de Predicción Deportiva
# Uso: ./consultar.sh "Toluca" "Tigres" "Liga MX"
#   o: ./consultar.sh "Toluca" "Tigres" "Liga MX" "2.10" "3.40" "3.80"
#   (los últimos 3 params son odds locales: momio_local momio_empate momio_visita)

MATCH_HOME="${1:-PSG}"
MATCH_AWAY="${2:-Arsenal}"
MATCH_LEAGUE="${3:-UEFA Champions League}"
ODDS_HOME="${4:-null}"
ODDS_DRAW="${5:-null}"
ODDS_AWAY="${6:-null}"
API="http://127.0.0.1:3456"
SCOUT_DATA="/tmp/apuestas-scout-data.json"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║      🔮 APUESTA.IA — PREDICCIÓN MULTI-AGENTE           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── FASE 1: SCOUT — Extraer datos reales ─────────────────────────────
echo "📡 [SCOUT] Extrayendo datos en vivo..."

SCOUT_DATA_JSON="{\"league\":\"$MATCH_LEAGUE\"}"

# 1a. Intentar odds de Caliente con agent-browser (si existe)
if command -v agent-browser &>/dev/null; then
  echo "   🔎 Buscando odds en FlashScore y OddsPortal..."
  agent-browser open "https://www.flashscore.com.mx/futbol/" 2>/dev/null
  sleep 2
  FLASH_DATA=$(agent-browser eval "
    var els = document.querySelectorAll('.event__match');
    var out = [];
    els.forEach(function(e) {
      var h = e.querySelector('.event__homeParticipant');
      var a = e.querySelector('.event__awayParticipant');
      var s = e.querySelector('.event__score');
      if (h && a) out.push({home: h.textContent.trim(), away: a.textContent.trim(), score: s ? s.textContent.trim() : ''});
    });
    JSON.stringify(out.slice(0, 5));
  " 2>/dev/null)
  agent-browser close --all 2>/dev/null
  if [ -n "$FLASH_DATA" ] && [ "$FLASH_DATA" != "[]" ]; then
    echo "   ✓ Partidos en vivo detectados desde FlashScore"
    SCOUT_DATA_JSON=$(echo "$SCOUT_DATA_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); d['flashscore_live']=$FLASH_DATA; print(json.dumps(d))" 2>/dev/null || echo "$SCOUT_DATA_JSON")
  fi
else
  echo "   ⚠ agent-browser no instalado, sin datos en vivo"
fi

# 1b. Si el usuario pasó odds manuales, usarlos. Si no, limpiar odds viejos.
if [ "$ODDS_HOME" != "null" ] && [ "$ODDS_DRAW" != "null" ] && [ "$ODDS_AWAY" != "null" ]; then
  echo "   ✓ Odds manuales: Local=$ODDS_HOME Empate=$ODDS_DRAW Visita=$ODDS_AWAY"
  SCOUT_DATA_JSON=$(echo "$SCOUT_DATA_JSON" | python3 -c "
import json,sys
d=json.load(sys.stdin)
d['odds']={'caliente':{'home':$ODDS_HOME,'draw':$ODDS_DRAW,'away':$ODDS_AWAY}}
print(json.dumps(d))
" 2>/dev/null || echo "$SCOUT_DATA_JSON")
  echo "   📊 Datos de mercado INCORPORADOS al modelo"
else
  # Limpiar odds viejos para que el modelo use solo Poisson
  SCOUT_DATA_JSON=$(echo "$SCOUT_DATA_JSON" | python3 -c "
import json,sys
d=json.load(sys.stdin)
d['odds']={'caliente':{}}
print(json.dumps(d))
" 2>/dev/null || echo "$SCOUT_DATA_JSON")
  echo "   ⚠ Sin odds disponibles — el modelo usará solo Poisson puro"
  echo "   💡 Para mejores resultados: agrega odds manuales"
  echo "      ./consultar.sh \"$MATCH_HOME\" \"$MATCH_AWAY\" \"$MATCH_LEAGUE\" 2.10 3.40 3.80"
fi

# Guardar datos del scout
echo "$SCOUT_DATA_JSON" > "$SCOUT_DATA"
echo "📡 [SCOUT] Enviando datos al motor..."
curl -s -X POST "$API/data" -H "Content-Type: application/json" -d "$SCOUT_DATA_JSON" > /dev/null 2>&1
echo "   ✓ Datos almacenados"
echo ""

# ─── FASE 2: ANALYST ──────────────────────────────────────────────────
echo "🧠 [ANALYST] Calculando modelo Poisson + ELO..."
ANALYSIS=$(curl -s -X POST "$API/analyze" -H "Content-Type: application/json" \
  -d "{\"home\":\"$MATCH_HOME\",\"away\":\"$MATCH_AWAY\"}")
echo "   ✓ Análisis completado"
echo ""

# ─── FASE 3: PREDICTOR ────────────────────────────────────────────────
echo "🎯 [PREDICTOR] Generando predicción final..."
PREDICTION=$(curl -s -X POST "$API/predict-final" -H "Content-Type: application/json" \
  -d "{\"home\":\"$MATCH_HOME\",\"away\":\"$MATCH_AWAY\"}")

echo "$PREDICTION" | python3 -c "
import json,sys
d = json.load(sys.stdin)
p = d['prediction']
m = d['match']
md = d['model']
odds = d.get('odds_used', {})
cal = odds.get('caliente', {})
ev = p.get('expected_value', 0)
print()
print('┌────────────────────────────────────────────────────────┐')
print(f'│  🔮 APUESTA.IA — PREDICCIÓN MULTI-AGENTE              │')
print('├────────────────────────────────────────────────────────┤')
print(f'│  Partido:    {m[\"home\"]} vs {m[\"away\"]}')
print(f'│  Liga:       {m[\"league\"]}')
print(f'│  Hora:       {d[\"timestamp\"][:19]}')
print('├────────────────────────────────────────────────────────┤')
print(f'│  📊 PROBABILIDADES (Dixon-Coles):')
print(f'│     {m[\"home\"]}:     {p[\"home_prob\"]}%')
print(f'│     Empate:          {p[\"draw_prob\"]}%')
print(f'│     {m[\"away\"]}:     {p[\"away_prob\"]}%')
print('├────────────────────────────────────────────────────────┤')
print(f'│  🏆 DECISIÓN: {p[\"bet_type\"]}')
if cal.get('home'):
    print(f'│  📈 Expected Value (EV): {ev * 100:.2f}%')
    if ev > 0:
        print(f'│  ✅ EV POSITIVO — Apuesta con valor matemático')
    else:
        print(f'│  🛑 EV NEGATIVO — Modelo rechaza la apuesta')
print(f'│  💰 Gestión (Kelly 1/4): {p[\"recommended_stake\"]}')
print(f'│  🎯 Confianza:    {p[\"confidence\"]}% ({p[\"confidence_label\"]})')
print('├────────────────────────────────────────────────────────┤')
if cal.get('home'):
    print(f'│  📊 Odds evaluados: {cal.get(\"home\",\"?\")} | {cal.get(\"draw\",\"?\")} | {cal.get(\"away\",\"?\")}')
else:
    print(f'│  ⚠ Sin odds — sin EV, sin Kelly')
print('├────────────────────────────────────────────────────────┤')
print(f'│  📋 Análisis del modelo:')
for r in p['reasoning']:
    print(f'│     • {r}')
print('├────────────────────────────────────────────────────────┤')
print(f'│  📊 Dixon-Coles: λ_local={md[\"lambda_home\"]:.2f} | λ_visita={md[\"lambda_away\"]:.2f}')
print(f'│  🤖 Scout(caliente) → Analyst(dixon-coles) → Predictor(kelly)')
print('└────────────────────────────────────────────────────────┘')
" 2>&1

echo ""
if [ "$ODDS_HOME" != "null" ]; then
  echo "📊 Análisis Risk-Neutral completado (Dixon-Coles + Kelly + EV)"
else
  echo "⚠️  Sin odds de mercado — solo Dixon-Coles (sin EV ni Kelly)"
  echo "💡 Pasa odds manuales para activar Value Betting:"
  echo "   ./consultar.sh \"$MATCH_HOME\" \"$MATCH_AWAY\" \"$MATCH_LEAGUE\" 2.10 3.40 3.80"
fi
echo "💾 Resultado guardado en ultima_prediccion.json"
echo "🔌 API: http://127.0.0.1:3456"
