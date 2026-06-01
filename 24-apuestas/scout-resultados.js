#!/usr/bin/env node
// APUESTA.IA — Buscador automático de resultados deportivos
// Usa DuckDuckGo (sin CAPTCHA) + ESPN + otras fuentes
//
// Uso: node scout-resultados.js                    (busca todos los pendientes)
//      node scout-resultados.js "Toluca" "Tigres"  (busca partido específico)

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());
const wait = ms => new Promise(r => setTimeout(r, ms));

const DB_PATH = path.join(__dirname, 'apuestas-data.json');
const SEARCH_HOME = process.argv[2];
const SEARCH_AWAY = process.argv[3];
const IS_ALL = !SEARCH_HOME;

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return { matches: [], predictions: [] }; }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function buscarResultadoDuckDuckGo(team1, team2) {
  try {
    const query = encodeURIComponent(`${team1} vs ${team2} resultado final marcador 2026`);
    const out = execSync(
      `curl -sL --max-time 10 -A "Mozilla/5.0" "https://html.duckduckgo.com/html/?q=${query}"`,
      { encoding: 'utf-8' }
    );
    // Buscar patrón de marcador como "1-1", "2-1", etc.
    const scoreMatch = out.match(/([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)\s*(\d+)\s*[-–]\s*(\d+)\s*([A-Za-záéíóúñÁÉÍÓÚÑ\s]+)/i);
    if (scoreMatch) {
      const local = scoreMatch[1].trim();
      const golesLocal = parseInt(scoreMatch[2]);
      const golesVisita = parseInt(scoreMatch[3]);
      const visita = scoreMatch[4].trim();
      // Verificar que los equipos coincidan
      if ((local.toLowerCase().includes(team1.toLowerCase()) || local.toLowerCase().includes(team2.toLowerCase())) &&
          (visita.toLowerCase().includes(team1.toLowerCase()) || visita.toLowerCase().includes(team2.toLowerCase()))) {
        return { home_score: golesLocal, away_score: golesVisita,
                 home: local, away: visita, method: 'DuckDuckGo' };
      }
    }
    // Buscar patrón ESPN: "Team1 X-Y Team2"
    const espnMatch = out.match(/([A-Za-záéíóúñ\s]+?)\s*(\d+)[-–](\d+)\s*\(/i);
    if (espnMatch) {
      const golesLocal = parseInt(espnMatch[2]);
      const golesVisita = parseInt(espnMatch[3]);
      if (golesLocal >= 0 && golesVisita >= 0) {
        return { home_score: golesLocal, away_score: golesVisita,
                 home: team1, away: team2, method: 'DuckDuckGo(ESPN)' };
      }
    }
  } catch(e) { /* silent */ }
  return null;
}

async function buscarResultadoConBrowser(team1, team2) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    const query = encodeURIComponent(`${team1} vs ${team2} resultado ${new Date().getFullYear()}`);
    await page.goto(`https://html.duckduckgo.com/html/?q=${query}`, { timeout: 15000 }).catch(() => {});
    await wait(4000);

    const text = await page.evaluate(() => document.body.innerText);

    // Buscar patrón de score
    const scoreRegex = new RegExp(`(${team1}[^]{0,100}?)(\\d+)[-–](\\d+)([^]{0,100}?${team2})`, 'i');
    const match = text.match(scoreRegex);
    
    await browser.close();

    if (match) {
      return {
        home_score: parseInt(match[2]),
        away_score: parseInt(match[3]),
        method: 'DuckDuckGo(browser)'
      };
    }

    // Buscar cualquier score cerca de los nombres
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(team1.toLowerCase()) || 
          lines[i].toLowerCase().includes(team2.toLowerCase())) {
        const nums = lines[i].match(/(\d+)[-–](\d+)/);
        if (nums && lines.slice(Math.max(0,i-1), i+3).join(' ').toLowerCase().includes(team1.toLowerCase()) &&
            lines.slice(Math.max(0,i-1), i+3).join(' ').toLowerCase().includes(team2.toLowerCase())) {
          return { home_score: parseInt(nums[1]), away_score: parseInt(nums[2]), method: 'DuckDuckGo(lines)' };
        }
      }
    }

    return null;
  } catch(e) {
    return null;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  🔮 APUESTA.IA — Buscador de Resultados       ║');
  console.log('╚════════════════════════════════════════════════╝');

  const db = loadDB();
  let pendientes = db.matches.filter(m => m.home_score === null);

  if (SEARCH_HOME && SEARCH_AWAY) {
    pendientes = pendientes.filter(m =>
      m.home.toLowerCase().includes(SEARCH_HOME.toLowerCase()) ||
      m.away.toLowerCase().includes(SEARCH_HOME.toLowerCase()) ||
      m.home.toLowerCase().includes(SEARCH_AWAY.toLowerCase()) ||
      m.away.toLowerCase().includes(SEARCH_AWAY.toLowerCase())
    );
  }

  if (pendientes.length === 0) {
    console.log('\n✅ Todos los partidos tienen resultados');
    return;
  }

  console.log(`\n📋 Buscando ${pendientes.length} resultado(s)...`);

  for (const match of pendientes) {
    console.log(`\n🔍 ${match.home} vs ${match.away}...`);

    // Try DuckDuckGo via curl first (fastest)
    let result = buscarResultadoDuckDuckGo(match.home, match.away);
    if (result) {
      console.log(`  ✓ ${result.home || match.home} ${result.home_score}-${result.away_score} ${result.away || match.away} (${result.method})`);
    } else {
      // Fallback: browser-based search
      console.log('  ⏳ Intentando con navegador...');
      result = await buscarResultadoConBrowser(match.home, match.away);
      if (result) {
        console.log(`  ✓ ${match.home} ${result.home_score}-${result.away_score} ${match.away} (${result.method})`);
      }
    }

    if (result) {
      match.home_score = result.home_score;
      match.away_score = result.away_score;
      match.result = result.home_score > result.away_score ? 'H' :
                     result.home_score < result.away_score ? 'A' : 'D';

      // Actualizar predicción correspondiente
      db.predictions.forEach(p => {
        if (p.home.toLowerCase() === match.home.toLowerCase() && 
            p.away.toLowerCase() === match.away.toLowerCase()) {
          p.actual_result = match.result;
          p.was_correct = p.winner === match.result ||
                          (p.winner === match.home && match.result === 'H') ||
                          (p.winner === match.away && match.result === 'A') ||
                          (p.winner === 'Empate' && match.result === 'D');
          console.log(`  📊 Predicción: ${p.winner} → ${p.was_correct ? '✅ CORRECTA' : '❌ INCORRECTA'}`);
        }
      });
    } else {
      console.log('  ✗ No se encontró resultado automáticamente');
      console.log('    💡 Busca manualmente y actualiza con:');
      console.log(`    node -e "const fs=require('fs'); const db=JSON.parse(fs.readFileSync('apuestas-data.json','utf-8')); db.matches.forEach(m=>{if(m.id==='${match.id}'){m.home_score=X;m.away_score=Y;m.result=m.home_score>m.away_score?'H':m.home_score<m.away_score?'A':'D';}}); fs.writeFileSync('apuestas-data.json',JSON.stringify(db,null,2));"`);
    }
  }

  saveDB(db);
  console.log(`\n💾 Base de datos guardada`);
  console.log(`📊 Dashboard: http://127.0.0.1:3456/dashboard`);
}

main().catch(console.error);
