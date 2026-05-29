#!/usr/bin/env bash
# APUESTA.IA — Inicia todos los servicios con PM2 (24/7)
# Uso: bash start-pm2.sh
# 
# Después de esto, los servicios:
#   - Corren en background (sin terminal)
#   - Se reinician automáticamente si fallan
#   - Arrancan solos cuando enciendes la Mac

SCRIPT_DIR="/Users/macbook/Proyectos/24-apuestas"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔮 APUESTA.IA — INICIANDO SERVICIOS CON PM2          ║"
echo "╚══════════════════════════════════════════════════════════╝"

# Matar procesos manuales si existen
pkill -f "pnpm dev" 2>/dev/null
pkill -f "server-predict" 2>/dev/null
sleep 1

# Iniciar con PM2
cd "$SCRIPT_DIR"
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Servicios iniciados con PM2"
echo ""
pm2 status
echo ""
echo "📊 Accesos:"
echo "   Local:      http://127.0.0.1:3000  (Mission Control)"
echo "   Local:      http://127.0.0.1:3456  (Dashboard)"
echo "   Dashboard:  http://127.0.0.1:3456/dashboard"
echo ""
echo "🌐 Desde otros dispositivos en la RED LOCAL:"
echo "   http://192.168.100.7:3000"
echo "   http://192.168.100.7:3456/dashboard"
echo ""
echo "🌐 Via Tailscale (desde cualquier lugar):"
echo "   http://100.117.41.68:3000"
echo "   http://100.117.41.68:3456/dashboard"
echo ""
echo "💡 Para que arranque solo al encender la Mac:"
echo "   pm2 startup"
echo "   (ejecuta esto UNA VEZ y PM2 se agrega al inicio del sistema)"