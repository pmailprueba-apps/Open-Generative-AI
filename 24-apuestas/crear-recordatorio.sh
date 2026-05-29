#!/usr/bin/env bash
# APUESTA.IA — Crea recordatorio en Calendar.app para un partido
# Uso: bash crear-recordatorio.sh "PSG" "Arsenal" "2026-05-30" "11:00" "Champions Final" "100" "2.28" "Recibo123"
# 
# Abre automáticamente Calendar.app para que importes el evento

HOME="${1:-Toluca}"
AWAY="${2:-Tigres}"
DATE="${3:-2026-05-30}"
TIME="${4:-18:00}"
LEAGUE="${5:-Liga MX}"
AMOUNT="${6:-100}"
ODDS="${7:-1.909}"
RECIBO="${8:-N/A}"

# Calcular ganancia posible
GAIN=$(echo "$AMOUNT * $ODDS" | bc 2>/dev/null || echo "$AMOUNT * $ODDS" | python3 -c "import sys; print(round(float(sys.stdin.read().strip()), 2))" 2>/dev/null || echo "?")
GAIN_INT=$(printf "%.0f" "$GAIN" 2>/dev/null || echo "?")

ICS_FILE="/tmp/apuestas-recordatorio.ics"
START="${DATE}T${TIME}00"
END_HOUR=$((10#${TIME%%:*} + 2))
END="${DATE}T${END_HOUR}:00:00"

cat > "$ICS_FILE" <<EOF
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//APUESTA.IA//Recordatorio//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:apuesta-${HOME}-${AWAY}-$$@apuestas.ia
DTSTAMP:$(date -u +%Y%m%dT%H%M%SZ)
DTSTART:${START}
DTEND:${END}
SUMMARY:⚽ ${HOME} vs ${AWAY} - \$${AMOUNT}
DESCRIPTION:Apuesta: \$${AMOUNT} a ${HOME} a ${ODDS}\nRecibo: #${RECIBO}\nPosible ganancia: \$${GAIN_INT}\n\nAPUESTA.IA - ${LEAGUE}
LOCATION:Caliente.mx
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Recordatorio: ${HOME} vs ${AWAY} en 1 hora
END:VALARM
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:¡${HOME} vs ${AWAY} ya casi empieza! 🍀
END:VALARM
END:VEVENT
END:VCALENDAR
EOF

open "$ICS_FILE"
echo "✅ Recordatorio creado para ${HOME} vs ${AWAY} (${DATE} ${TIME})"