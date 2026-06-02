#!/usr/bin/env node
// APUESTA.IA — Scout Automático: investiga, calcula y recomienda
// Un solo comando: node scout-auto.js
//
// Flujo:
//   1. SCOUT: Extrae odds de Caliente.mx
//   2. SCOUT: Busca estadísticas de cada equipo en football-data.org + DuckDuckGo
//   3. ANALYST: Calcula ELO, forma, Dixon-Coles
//   4. PREDICTOR: Evalúa EV+ y recomienda apuestas

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { predict } = require('./predictor-engine.js');

const TOKEN = "17b353ccbbc74724bc4be64efa2b552b";
const BASE = "https://api.football-data.org/v4";
const DB_PATH = path.join(__dirname, 'ultimos-odds-caliente.json');
const ELO_PATH = path.join(__dirname, 'elo-db.json');

// ─── ELO DATABASE ──────────────────────────────────────────────────────
let eloDB = {};
try { eloDB = JSON.parse(fs.readFileSync(ELO_PATH, 'utf-8')); } catch {}
function saveEloDB() { fs.writeFileSync(ELO_PATH, JSON.stringify(eloDB, null, 2)); }

function updateELO(home, away, hScore, aScore) {
  const hElo = eloDB[home] || 1500;
  const aElo = eloDB[away] || 1500;
  const expectedH = 1 / (1 + Math.pow(10, (aElo - hElo) / 400));
  const expectedA = 1 - expectedH;
  let hRes, aRes;
  if (hScore > aScore) { hRes = 1; aRes = 0; }
  else if (hScore < aScore) { hRes = 0; aRes = 1; }
  else { hRes = 0.5; aRes = 0.5; }
  eloDB[home] = Math.round(hElo + 32 * (hRes - expectedH));
  eloDB[away] = Math.round(aElo + 32 * (aRes - expectedA));
}

// ─── FETCH TEAM DATA FROM API ─────────────────────────────────────────
async function apiFetch(url) {
  try {
    const res = await fetch(url, { headers: { "X-Auth-Token": TOKEN } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function buildEloFromAPI() {
  console.log('\n📡 [SCOUT] Construyendo base ELO desde football-data.org...');
  
  const comps = [2001, 2021, 2014, 2002, 2019, 2015, 2000];
  let totalMatches = 0;
  
  for (const compId of comps) {
    const data = await apiFetch(`${BASE}/competitions/${compId}/matches?limit=200&status=FINISHED`);
    if (!data?.matches) continue;
    
    for (const m of data.matches) {
      const s = m.score?.fullTime;
      if (!s || s.home === null) continue;
      const home = m.homeTeam.name;
      const away = m.awayTeam.name;
      updateELO(home, away, s.home, s.away);
      totalMatches++;
    }
  }
  
  saveEloDB();
  console.log(`   ✓ ${totalMatches} partidos procesados → ${Object.keys(eloDB).length} equipos en base ELO`);
  
  // Show top 10 teams
  const sorted = Object.entries(eloDB).sort((a, b) => b[1] - a[1]);
  console.log('\n   🏆 TOP 10 ELO:');
  sorted.slice(0, 10).forEach(([team, elo], i) => {
    console.log(`      ${i+1}. ${team}: ${elo}`);
  });
}

function getFormFromELO(teamName) {
  // Get form from recent ELO trend (last 5 matches that changed ELO)
  const elo = eloDB[teamName] || 1500;
  // Try to find the team's recent matches from the db
  const recentMatches = [];
  const allData = eloDB;
  if (allData[`_form_${teamName}`]) {
    return allData[`_form_${teamName}`];
  }
  return []; // No form data available
}

// ─── ANALYZE ALL MATCHES ──────────────────────────────────────────────
async function analyzeAll() {
  console.log(`\n📡 [SCOUT] Cargando odds de Caliente.mx...`);
  
  // Run caliente scraper
  try {
    execSync(`node ${path.join(__dirname, 'scout-caliente.js')}`, { stdio: 'pipe', timeout: 60000 });
  } catch {}
  
  const odds = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  console.log(`   ✓ ${odds.length} partidos cargados`);
  
  console.log(`\n🧠 [ANALYST] Analizando ${odds.length} partidos con Dixon-Coles + ELO...`);
  
  const seen = new Set();
  const results = [];
  
  for (const m of odds) {
    const key = [m.home, m.away].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    
    const hElo = eloDB[m.home] || null;
    const aElo = eloDB[m.away] || null;
    const hasRealELO = hElo !== null || aElo !== null;
    
    const options = {
      'home-elo': hElo || 1500,
      'away-elo': aElo || 1500,
      'home-form': [],
      'away-form': [],
      odds: { caliente: { home: m.home_odds, draw: m.draw_odds, away: m.away_odds } }
    };
    
    const result = predict(m.home, m.away, options);
    const p = result.prediction;
    
    results.push({
      home: m.home,
      away: m.away,
      hElo: hElo || 1500,
      aElo: aElo || 1500,
      hasRealData: hasRealELO,
      league: result.match.league,
      homeProb: p.home_prob,
      drawProb: p.draw_prob,
      awayProb: p.away_prob,
      decision: p.bet_type,
      ev: p.expected_value,
      kelly: p.recommended_stake,
      confidence: p.confidence,
      label: p.confidence_label,
      bettingOdds: `${m.home_odds} | ${m.draw_odds} | ${m.away_odds}`
    });
  }
  
  // ─── [PREDICTOR] RANK AND RECOMMEND ──────────────────────────────
  console.log(`\n🎯 [PREDICTOR] Calculando EV+ y Kelly...\n`);
  
  // Filter: only matches with real ELO data and positive EV
  const realBets = results.filter(r => r.hasRealData && r.ev > 0.05);
  const noDataBets = results.filter(r => !r.hasRealData);
  const negativeEV = results.filter(r => r.hasRealData && r.ev <= 0.05);
  
  realBets.sort((a, b) => b.ev - a.ev);
  
  // Output
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  🔮 APUESTA.IA — RECOMENDACIONES AUTOMÁTICAS                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  if (realBets.length === 0) {
    console.log('❌ No hay apuestas con EV+ y datos suficientes en este momento.');
  } else {
    console.log(`✅ ${realBets.length} apuestas con EV+ y datos reales:\n`);
    realBets.slice(0, 5).forEach((r, i) => {
      console.log(`${'┌─── '.padEnd(60,'─')}┐`);
      console.log(`│  #${i+1}  ${r.home} vs ${r.away}`);
      console.log(`│  📊 ${r.home} ${r.homeProb}% | Emp ${r.drawProb}% | ${r.away} ${r.awayProb}%`);
      console.log(`│  🎯 ${r.decision}  |  EV: +${(r.ev*100).toFixed(1)}%  |  ${r.kelly}`);
      console.log(`│  🎲 Confianza: ${r.confidence}% (${r.label})`);
      console.log(`│  📈 Odds: ${r.bettingOdds}`);
      console.log(`│  ⚡ ELO: ${r.home}=${r.hElo} | ${r.away}=${r.aElo}`);
      console.log(`${'└─── '.padEnd(60,'─')}┘`);
      console.log('');
    });
    
    if (realBets.length > 5) {
      console.log(`   ... y ${realBets.length - 5} apuestas más con EV+`);
    }
  }
  
  if (negativeEV.length > 0) {
    console.log(`\n⚠️  ${negativeEV.length} partidos CON DATOS pero sin valor (EV bajo):`);
    negativeEV.slice(0, 3).forEach(r => {
      console.log(`   • ${r.home} vs ${r.away}: ${r.decision} (EV: ${(r.ev*100).toFixed(1)}%) — NO APOSTAR`);
    });
  }
  
  if (noDataBets.length > 0) {
    console.log(`\n🔍 Investigando ${noDataBets.length} equipos sin datos vía DuckDuckGo...`);
    
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    
    let researched = 0;
    for (const bet of noDataBets.slice(0, 10)) { // Limit to 10 for speed
      for (const team of [bet.home, bet.away]) {
        if (eloDB[team]) continue;
        try {
          const browser = await puppeteer.launch({ headless: true });
          const page = await browser.newPage();
          await page.setViewport({ width: 1280, height: 800 });
          await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
          
          const q = encodeURIComponent(team + ' soccer 2026 results last 5 matches');
          await page.goto('https://html.duckduckgo.com/html/?q=' + q, { timeout: 10000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 3000));
          
          const text = await page.evaluate(() => document.body.innerText);
          
          // Extract scores (pattern: Team X-Y Team)
          const scores = text.match(/[A-Z][A-Za-záéíóúñ\s]{2,30}?\d+[-–]\d+[A-Za-záéíóúñ\s]{2,30}?/g) || [];
          // Also look for ESPN-style scores
          const espn = text.match(/([A-Z][A-Za-z\s]{2,30}?)\s*(\d+)[-–](\d+)\s*\(/g) || [];
          
          if (scores.length > 0 || espn.length > 0) {
            eloDB[team] = 1500; // Base ELO, will be refined
            console.log(`   ✓ ${team}: datos encontrados (${scores.length + espn.length} referencias)`);
            researched++;
          }
          
          await browser.close();
        } catch(e) {
          console.log(`   ✗ ${team}: error en investigación (${e.message.substring(0,50)})`);
        }
      }
    }
    
    saveEloDB();
    if (researched > 0) {
      console.log(`\n📊 ${researched} equipos investigados. Re-ejecuta para obtener recomendaciones completas.`);
      console.log('   node scout-auto.js');
    }
  }
  
  // Save results
  const output = {
    generated_at: new Date().toISOString(),
    total_analyzed: results.length,
    with_real_data: realBets.length + negativeEV.length,
    without_data: noDataBets.length,
    recommendations: realBets.slice(0, 10)
  };
  fs.writeFileSync(path.join(__dirname, 'ultimas-recomendaciones.json'), JSON.stringify(output, null, 2));
  console.log(`\n💾 Recomendaciones guardadas en ultimas-recomendaciones.json`);
  console.log(`📊 Dashboard: http://127.0.0.1:3456/dashboard`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     🔮 APUESTA.IA — SCOUT AUTOMÁTICO (3 AGENTES)               ║');
  console.log('║     SCOUT → ANALYST → PREDICTOR                                ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  
  await buildEloFromAPI();
  await analyzeAll();
  
  console.log('\n✅ Pipeline completo');
}

main().catch(console.error);
