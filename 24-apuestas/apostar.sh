#!/usr/bin/env bash
# APUESTA.IA — Apostar a cualquier deporte con momios manuales
# Uso: ./apostar.sh futbol "Toluca" "Tigres" "2.10,3.30,3.50"
#       ./apostar.sh basketball "Lakers" "Celtics" "1.90,1.90"
#       ./apostar.sh baseball "Yankees" "Dodgers" "1.80,2.05"

SPORT="${1:-futbol}"
TEAM1="${2:-Toluca}"
TEAM2="${3:-Tigres}"
ODDS="${4:-}"

case "$SPORT" in
  futbol|football)
    SPORT_EN="football"
    EMOJI="⚽"
    ;;
  basketball|basquet|basquetbol)
    SPORT_EN="basketball"
    EMOJI="🏀"
    ;;
  baseball|beisbol)
    SPORT_EN="baseball"
    EMOJI="⚾"
    ;;
  *)
    echo "Deporte no válido. Usa: futbol, basketball, baseball"
    exit 1
    ;;
esac

echo ""
echo "${EMOJI} APUESTA.IA — ${SPORT}: ${TEAM1} vs ${TEAM2}"
echo "================================================"

# Si hay odds, pasarlos al modelo
if [ -n "$ODDS" ]; then
  # Contar cuántos odds se pasaron
  IFS=',' read -ra ODDS_ARRAY <<< "$ODDS"
  NUM_ODDS=${#ODDS_ARRAY[@]}
  
  H="${ODDS_ARRAY[0]}"
  
  if [ "$SPORT_EN" = "football" ] && [ "$NUM_ODDS" -ge 3 ]; then
    # Fútbol: 3 odds (1X2)
    D="${ODDS_ARRAY[1]}"
    A="${ODDS_ARRAY[2]}"
    ODDS_JSON="{\"caliente\":{\"home\":$H,\"draw\":$D,\"away\":$A}}"
  elif [ "$NUM_ODDS" -ge 2 ]; then
    # Básquet/Béisbol: 2 odds (moneyline)
    A="${ODDS_ARRAY[1]}"
    ODDS_JSON="{\"caliente\":{\"home\":$H,\"away\":$A}}"
  else
    ODDS_JSON="{}"
  fi
else
  ODDS_JSON="{}"
fi

# Ejecutar el predictor correspondiente
curl -s -X POST "http://127.0.0.1:3456/predict/$SPORT_EN" \
  -H "Content-Type: application/json" \
  -d "{\"home\":\"$TEAM1\",\"away\":\"$TEAM2\",\"odds\":$ODDS_JSON}"   | python3 -c "
import json,sys
d = json.load(sys.stdin)
if 'prediction' not in d:
    print('ERROR: Respuesta inesperada:', json.dumps(d, indent=2)[:200])
    sys.exit(1)
p = d['prediction']
m = d['match']
print()

sport = d['match'].get('sport','football')
if sport == 'football':
    print(f'📊 Probabilidades: {m[\"home\"]} {p.get(\"home_prob\",\"?\")}% | Empate {p.get(\"draw_prob\",\"?\")}% | {m[\"away\"]} {p.get(\"away_prob\",\"?\")}%')
    print(f'🎯 Decisión: {p.get(\"bet_type\",\"?\")}')
    ev = p.get('expected_value',0)
    if ev:
        print(f'📈 EV: +{round(ev*100 if ev<1 else ev,2)}%')
else:
    print(f'📊 Probabilidades: {m[\"home\"]} {p.get(\"home_win_prob\",\"?\")}% | {m[\"away\"]} {p.get(\"away_win_prob\",\"?\")}%')
    print(f'🎯 Ganador: {p.get(\"winner\",\"?\")}')
    spread = p.get('spread_expected')
    if spread: print(f'📐 Spread esperado: {spread} puntos')
    total = p.get('expected_total')
    if total: print(f'📊 Total esperado: {total} pts')

rec = p.get('recommendation','')
if 'EV:' in rec and 'Kelly:' in rec:
    print(f'💰 {rec}')
elif rec and 'NO APOSTAR' not in rec:
    print(f'💰 {rec}')
else:
    print(f'💰 {rec or \"No hay recomendación (sin odds)\"}')

print(f'🧠 Modelo: {p.get(\"model\",\"Dixon-Coles\")}')
print()
" 2>&1

echo "💡 Para ver más: curl -s http://127.0.0.1:3456/dashboard | grep -o '<title>.*</title>'"
