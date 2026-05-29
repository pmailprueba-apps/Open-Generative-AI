#!/usr/bin/env bash
# Scraper para Caliente.mx usando curl + parsing HTML
set -euo pipefail

MATCH_HOME="${1:-PSG}"
MATCH_AWAY="${2:-Arsenal}"

echo "{"
echo '  "match": "'"$MATCH_HOME vs $MATCH_AWAY"'",'
echo '  "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",'

# Intentar varias fuentes
CALIENTE_RAW=$(curl -sL --max-time 10 "https://sports.caliente.mx/es_MX/Futbol" 2>/dev/null || echo "")
CODERERAW=$(curl -sL --max-time 10 "https://blog.codere.mx/futbol/" 2>/dev/null || echo "")

# Extraer información relevante de Caliente
if [ -n "$CALIENTE_RAW" ]; then
  MATCHES=$(echo "$CALIENTE_RAW" | grep -i -o '"es_MX/e/[^"]*"' | head -5 | tr '\n' ' ')
  ODDS1=$(echo "$CALIENTE_RAW" | grep -i -oP '1\s+\d+/\d+' | head -3 | tr '\n' ' ')
  ODDSX=$(echo "$CALIENTE_RAW" | grep -i -oP 'X\s+\d+/\d+' | head -3 | tr '\n' ' ')
  ODDS2=$(echo "$CALIENTE_RAW" | grep -i -oP '2\s+\d+/\d+' | head -3 | tr '\n' ' ')
fi

echo '  "caliente_urls": "'"${MATCHES:-NO_DATA}"'",'
echo '  "caliente_odds_1": "'"${ODDS1:-NO_DATA}"'",'
echo '  "caliente_odds_x": "'"${ODDSX:-NO_DATA}"'",'
echo '  "caliente_odds_2": "'"${ODDS2:-NO_DATA}"'",'

# Extraer contenido del blog Codere
if [ -n "$CODERERAW" ]; then
  ARTICLES=$(echo "$CODERERAW" | grep -i -oP 'href="[^"]*futbol[^"]*"' | head -3 | tr '\n' ' ')
fi
echo '  "codere_articles": "'"${ARTICLES:-NO_DATA}"'",'

echo '  "scrape_status": "complete"'
echo "}"
