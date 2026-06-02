#!/usr/bin/env node
// APUESTA.IA — Orquestador completo de datos
// Combina: Caliente (odds) + football-data.org (EU stats) + DuckDuckGo (MX stats)
//
// Uso: node scout-completo.js "Toluca" "Tigres" "Liga MX"
//      node scout-completo.js "PSG" "Arsenal" "UEFA Champions League"

const TOKEN = "17b353ccbbc74724bc4be64efa2b552b";
const BASE = "https://api.football-data.org/v4";
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOME = process.argv[2];
const AWAY = process.argv[3];
const LEAGUE = process.argv[4] || '';

if (!HOME || !AWAY) {
  console.log('Uso: node scout-completo.js "Toluca" "Tigres" "Liga MX"');
  process.exit(1);
}

async function api(url) {
  const res = await fetch(url, { headers: { "X-Auth-Token": TOKEN } });
  if (!res.ok) return null;
  return res.json();
}

function buscarEnDuckDuckGo(consulta) {
  const q = encodeURIComponent(consulta);
  try {
    const html = execSync(
      `curl -sL --max-time 10 -A "Mozilla/5.0" "https://html.duckduckgo.com/html/?q=${q}"`,
      { encoding: 'utf-8', timeout: 15000 }
    );
    // Extraer scores: pattern "Team X-Y Team" or "Team X-Y-Team"
    const scores = html.match(/[A-Za-záéíóúñÁÉÍÓÚÑ\s]{3,30}?\d+[-–]\d+[A-Za-záéíóúñÁÉÍÓÚÑ\s]{3,30}?/g) || [];
    return scores.filter(s => s.length > 10 && s.length < 100);
  } catch { return []; }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  🔮 APUESTA.IA — Scout Completo                 ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n📋 ${HOME} vs ${AWAY} (${LEAGUE || '?'})`);
  console.log('────────────────────────────────────────────\n');

  // FASE 1: Odds de Caliente
  console.log('📡 [1/3] Buscando odds en Caliente.mx...');
  try {
    execSync(`node ${path.join(__dirname, 'scout-caliente.js')} "${HOME}" "${AWAY}" 2>/dev/null`, {
      stdio: 'inherit', timeout: 60000
    });
  } catch {
    console.log('  ⚠️ No se pudieron obtener odds de Caliente');
  }

  // FASE 2: Estadísticas vía football-data (para ligas europeas)
  const isEuropean = LEAGUE.includes('Champions') || LEAGUE.includes('Premier') ||
                     LEAGUE.includes('La Liga') || LEAGUE.includes('Bundesliga') ||
                     LEAGUE.includes('Serie A') || LEAGUE.includes('Ligue 1') ||
                     LEAGUE.includes('Europa') || LEAGUE.includes('UEFA');

  if (isEuropean) {
    console.log('\n📡 [2/3] Estadísticas vía football-data.org...');
    try {
      const comps = { 'Champions': 2001, 'Premier': 2021, 'La Liga': 2014,
                      'Bundesliga': 2002, 'Serie A': 2019, 'Ligue 1': 2015 };
      const compId = Object.entries(comps).find(([k]) => LEAGUE.includes(k))?.[1];
      if (compId) {
        const data = await api(`${BASE}/competitions/${compId}/matches?limit=50`);
        const matches = data?.matches?.filter(m => m.status === 'FINISHED' &&
          m.score?.fullTime?.home !== null) || [];
        // Encontrar partidos del equipo
        const teamMatches = matches.filter(m =>
          m.homeTeam.name.toLowerCase().includes(HOME.toLowerCase()) ||
          m.awayTeam.name.toLowerCase().includes(HOME.toLowerCase()) ||
          m.homeTeam.name.toLowerCase().includes(AWAY.toLowerCase()) ||
          m.awayTeam.name.toLowerCase().includes(AWAY.toLowerCase())
        ).slice(0, 10);
        if (teamMatches.length > 0) {
          console.log(`  ✓ ${teamMatches.length} partidos encontrados para estos equipos`);
          teamMatches.forEach(m => {
            console.log(`    ${m.homeTeam.name} ${m.score.fullTime.home}-${m.score.fullTime.away} ${m.awayTeam.name}`);
          });
        }
      }
    } catch {}
  } else {
    // FASE 2b: DuckDuckGo para ligas mexicanas
    console.log('\n📡 [2/3] Estadísticas vía DuckDuckGo...');
    const consultas = [
      `${HOME} ultimos partidos 2026 resultado`,
      `${AWAY} ultimos partidos 2026 resultado`,
      `${HOME} vs ${AWAY} estadisticas`
    ];
    for (const q of consultas) {
      console.log(`  🔎 Buscando: "${q}"...`);
      const resultados = buscarEnDuckDuckGo(q);
      resultados.slice(0, 5).forEach(r => console.log(`    ${r}`));
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // FASE 3: Predicción final con todos los datos
  console.log('\n📡 [3/3] Generando predicción...');
  console.log(`\n💡 Para consultar con los odds encontrados:`);
  console.log(`   ./consultar.sh "${HOME}" "${AWAY}" "${LEAGUE}" 2.10 3.40 3.80`);
  console.log('\n✅ Scout completo finalizado');
}

main().catch(console.error);
