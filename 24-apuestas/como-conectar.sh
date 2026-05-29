#!/usr/bin/env bash
# APUESTA.IA — Diagnóstico de conexión
# Muestra las URLs correctas para cada dispositivo según la red

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔮 APUESTA.IA — CÓMO CONECTAR DESDE OTRO DISPOSITIVO ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Obtener IPs
WIFI=$(ifconfig en0 2>/dev/null | grep 'inet ' | awk '{print $2}')
TAIL=$(ifconfig utun4 2>/dev/null | grep 'inet ' | awk '{print $2}')
NAME=$(scutil --get ComputerName 2>/dev/null | tr "’'" "-" | tr " " "-" | tr -d "'")

echo "📡 IP de esta Mac en WiFi:  $WIFI"
echo "📡 IP en Tailscale:         ${TAIL:-No conectado}"
echo ""

echo "┌────────────────────────────────────────────────────────────────┐"
echo "│  ✅ SI EL IPAD ESTÁ EN LA MISMA RED WIFI:                     │"
echo "│                                                                  │"
echo "│  📊 Dashboard:  http://$WIFI:3456/dashboard                 │"
echo "│  🎛️ Mission Ctl: http://$WIFI:3000                          │"
echo "│                                                                  │"
echo "│  💡 Si no carga: revisa que el iPad esté en la MISMA WiFi       │"
echo "│     y que el router no tenga "aislamiento de clientes" activado │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""

if [ -n "$TAIL" ]; then
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│  🌐 SI EL IPAD ESTÁ EN OTRA RED (datos/u otra WiFi):          │"
echo "│                                                                  │"
echo "│  1. Instala Tailscale en el iPad (App Store)                    │"
echo "│  2. Conéctalo a tu misma cuenta Tailscale                       │"
echo "│  3. Abre:                                                        │"
echo "│                                                                  │"
echo "│  📊 Dashboard:  http://$TAIL:3456/dashboard                  │"
echo "│  🎛️ Mission Ctl: http://$TAIL:3000                           │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
fi

echo "┌────────────────────────────────────────────────────────────────┐"
echo "│  🔧 SOLUCIÓN RÁPIDA (si nada funciona):                        │"
echo "│                                                                  │"
echo "│  1. Conecta el iPad a la MISMA red WiFi que la Mac              │"
echo "│  2. Abre Safari en el iPad y escribe EXACTAMENTE:               │"
echo "│                                                                  │"
echo "│     http://$WIFI:3456/dashboard                              │"
echo "│                                                                  │"
echo "│  3. Para Mission Control:                                       │"
echo "│     http://$WIFI:3000                                          │"
echo "│     Usuario: admin  Contraseña: Alduke2026!!                    │"
echo "└────────────────────────────────────────────────────────────────┘"