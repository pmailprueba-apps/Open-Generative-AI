#!/usr/bin/env bash
# APUESTA.IA — Inicia todos los servicios
# Uso: bash start-all.sh

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🔮 APUESTA.IA — INICIANDO SERVICIOS                 ║"
echo "╚══════════════════════════════════════════════════════════╝"

# 1. Verificar que Mission Control (APUESTA.IA dashboard) esté corriendo
if curl -s -o /dev/null -w "" http://127.0.0.1:3000/login 2>/dev/null; then
  echo "✅ Dashboard APUESTA.IA: http://127.0.0.1:3000"
else
  echo "⚠️  Dashboard no detectado. Inicia con: cd ~/mission-control && pnpm dev"
fi

# 2. Iniciar Prediction API
if curl -s -o /dev/null -w "" http://127.0.0.1:3456/health 2>/dev/null; then
  echo "✅ Prediction API: http://127.0.0.1:3456"
else
  cd /Users/macbook/Proyectos/24-apuestas
  nohup node server-predict.js > /tmp/server-predict.log 2>&1 &
  echo "✅ Prediction API iniciado en http://127.0.0.1:3456 (PID: $!)"
fi

echo ""
echo "📊 Dashboard:      http://127.0.0.1:3000"
echo "🔌 Prediction API: http://127.0.0.1:3456"
echo "🔮 Consulta:       bash consultar.sh \"PSG\" \"Arsenal\" \"UEFA Champions League\""