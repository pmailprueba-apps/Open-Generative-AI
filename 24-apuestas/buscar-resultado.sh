#!/usr/bin/env bash
# APUESTA.IA — Buscador de resultados en cuotasahora.com
# Uso: bash buscar-resultado.sh "Toluca" "Tigres"

TEAM1="${1:-Toluca}"
TEAM2="${2:-Tigres}"

echo "🔍 Buscando: $TEAM1 vs $TEAM2 en cuotasahora.com..."

agent-browser close --all 2>/dev/null

# Paso 1: Abrir cuotasahora
agent-browser open "https://www.cuotasahora.com" 2>/dev/null
sleep 3

# Paso 2: Click en FÚTBOL
agent-browser snapshot -i -c 2>/dev/null | grep -i "futbol" | head -3
# Try to find and click the football section
agent-browser eval "
  var els = document.querySelectorAll('a, div, span, li');
  for(var i=0;i<els.length;i++){
    var t=(els[i].textContent||'').trim().toUpperCase();
    if(t==='FÚTBOL'||t==='FUTBOL'){
      if(els[i].offsetParent!==null){els[i].click();break;}
    }
  }
" 2>/dev/null
sleep 3

# Paso 3: Click en "Resultados"
agent-browser eval "
  var els = document.querySelectorAll('a');
  for(var i=0;i<els.length;i++){
    var t=(els[i].textContent||'').trim().toUpperCase();
    if(t==='RESULTADOS'){els[i].click();break;}
  }
" 2>/dev/null
sleep 3

# Paso 4: Buscar equipos en página
agent-browser eval "
  var text = document.body.innerText;
  var team1 = '$TEAM1';
  var team2 = '$TEAM2';
  var idx = text.indexOf(team1);
  if(idx<0) idx = text.indexOf(team2);
  if(idx>0){
    text.substring(Math.max(0,idx-300), idx+500);
  } else {
    'NO ENCONTRADO - scroll down';
  }
" 2>/dev/null

# Paso 5: Scroll down and search more
agent-browser eval "window.scrollBy(0,2000);" 2>/dev/null
sleep 2
agent-browser eval "
  var text = document.body.innerText;
  var team1 = '$TEAM1';
  var team2 = '$TEAM2';
  var idx = text.indexOf(team1);
  if(idx<0) idx = text.indexOf(team2);
  if(idx>0){
    var result = text.substring(Math.max(0,idx-400), idx+600);
    // Try to extract score
    var score = result.match(/[0-9]+\\s*[-–:]\\s*[0-9]+/g);
    result + '\\n\\nSCORES FOUND: ' + (score ? score.join(', ') : 'none');
  } else {
    'NO ENCONTRADO';
  }
" 2>/dev/null

agent-browser close --all 2>/dev/null
echo ""
echo "---"
echo "Si no encontró el resultado, inténtalo manualmente:"
echo "  1. Abre Safari y ve a: https://www.cuotasahora.com"
echo "  2. Navega a Fútbol > Resultados > México > Liga MX"
echo "  3. Busca el partido $TEAM1 vs $TEAM2"
echo "  4. Anota el marcador"
echo ""
echo "Luego actualiza la BD con:"
echo "  node -e \"const fs=require('fs'); \
const db=JSON.parse(fs.readFileSync('apuestas-data.json','utf-8')); \
db.matches.forEach(m=>{if(m.home.includes('$TEAM1')){m.home_score=X;m.away_score=Y; \
m.result=m.home_score>m.away_score?'H':m.home_score<m.away_score?'A':'D';}}); \
fs.writeFileSync('apuestas-data.json',JSON.stringify(db,null,2)); \
console.log('Actualizado')\""
