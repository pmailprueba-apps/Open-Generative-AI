#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Iniciando Servidor de Proyectos Antigravity..."
echo "------------------------------------------------"
echo "Abriendo navegador en el centro de proyectos..."
open "http://localhost:3000"
npx serve -l 3000 .
