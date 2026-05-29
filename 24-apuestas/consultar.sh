#!/usr/bin/env bash
# APUESTA.IA — Consulta de Predicción Deportiva
# Conecta Scout (opencode) → Analyst (claude-code) → Predictor (gemini)
#
# Uso: ./consultar.sh "PSG" "Arsenal" "UEFA Champions League"

MATCH_HOME="${1:-PSG}"
MATCH_AWAY="${2:-Arsenal}"
MATCH_LEAGUE="${3:-UEFA Champions League}"
API="http://127.0.0.1:3456"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║      🔮 APUESTA.IA — PREDICCIÓN MULTI-AGENTE           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# FASE 1: SCOUT (opencode)
echo "📡 [SCOUT] opencode — Extrayendo datos de Caliente.mx..."
CALIENTE_RAW=$(curl -sL --max-time 8 -A "Mozilla/5.0" "https://sports.caliente.mx/es_MX/Futbol" 2>/dev/null)
echo "   ✓ Caliente.mx: $(echo "$CALIENTE_RAW" | wc -c) bytes"

echo "📡 [SCOUT] Consultando Codere.mx..."
CODERERAW=$(curl -sL --max-time 8 "https://blog.codere.mx/futbol/" 2>/dev/null)
echo "   ✓ Codere.mx: $(echo "$CODERERAW" | wc -c) bytes"

echo "📡 [SCOUT] Enviando datos al motor..."
curl -s -X POST "$API/data" -H "Content-Type: application/json" -d "{\"league\":\"$MATCH_LEAGUE\"}" > /dev/null 2>&1
echo "   ✓ Datos almacenados en prediction engine"
echo ""

# FASE 2: ANALYST (claude-code)
echo "🧠 [ANALYST] claude-code — Analizando estadísticas..."
ANALYSIS=$(curl -s -X POST "$API/analyze" -H "Content-Type: application/json" -d "{\"home\":\"$MATCH_HOME\",\"away\":\"$MATCH_AWAY\"}")
echo "   ✓ Análisis completado"
echo ""

# FASE 3: PREDICTOR (gemini)
echo "🎯 [PREDICTOR] gemini — Generando predicción final..."
PREDICTION=$(curl -s -X POST "$API/predict-final" -H "Content-Type: application/json" -d "{\"home\":\"$MATCH_HOME\",\"away\":\"$MATCH_AWAY\"}")

echo "$PREDICTION" | python3 -c "
import json,sys
d = json.load(sys.stdin)
p = d['prediction']
m = d['match']
md = d['model']
print()
print('┌────────────────────────────────────────────────────────┐')
print(f'│  Partido:    {m[\"home\"]} vs {m[\"away\"]}')
print(f'│  Liga:       {m[\"league\"]}')
print(f'│  Hora:       {d[\"timestamp\"][:19]}')
print('├────────────────────────────────────────────────────────┤')
print(f'│  {m[\"home\"]}:     {p[\"home_prob\"]}%')
print(f'│  Empate:          {p[\"draw_prob\"]}%')
print(f'│  {m[\"away\"]}:     {p[\"away_prob\"]}%')
print('├────────────────────────────────────────────────────────┤')
print(f'│  🏆 GANADOR: {p[\"winner\"]}')
print(f'│  Apuesta:      {p[\"bet_type\"]}')
print(f'│  Confianza:    {p[\"confidence\"]}% ({p[\"confidence_label\"]})')
print(f'│  Stake rec:    {p[\"recommended_stake\"]}')
print('├────────────────────────────────────────────────────────┤')
print('│  📋 Factores del modelo:')
for r in p['reasoning']:
    print(f'│     • {r}')
print('├────────────────────────────────────────────────────────┤')
print(f'│  🤖 Scout(opencode) → Analyst(claude-code) → Predictor(gemini)')
print(f'│  📊 Poisson: λ_local={md[\"lambda_home\"]:.2f} | λ_visita={md[\"lambda_away\"]:.2f}')
print('└────────────────────────────────────────────────────────┘')
" 2>&1

echo ""
echo "💾 Resultado guardado en ultima_prediccion.json"
echo "📊 Dashboard: http://127.0.0.1:3000"
echo "🔌 API: http://127.0.0.1:3456"