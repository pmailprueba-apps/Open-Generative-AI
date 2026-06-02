#!/usr/bin/env node
// APUESTA.IA — Extractor completo de estadísticas vía football-data.org API
// Forma reciente, ELO, H2H, clasificación, goles promedio
//
// Uso: node scout-estadisticas.js "Toluca" "Tigres"
//      node scout-estadisticas.js --update (actualiza BD con datos de todos los equipos)

const TOKEN = "17b353ccbbc74724bc4be64efa2b552b";
const BASE = "https://api.football-data.org/v4";
const fs = require('fs');
const path = require('path');

const SEARCH_HOME = process.argv[2];
const SEARCH_AWAY = process.argv[3];
const IS_UPDATE = process.argv[2] === '--update';

const DB_PATH = path.join(__dirname, 'apuestas-data.json');
let eloCache = {};

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return { matches: [], predictions: [] }; }
}
function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

async function api(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": TOKEN }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.substring(0, 100)}`);
  }
  return res.json();
}

function extractScore(match) {
  const s = match.score?.fullTime || {};
  const home = match.homeTeam?.name || '';
  const away = match.awayTeam?.name || '';
  return {
    home, away,
    homeScore: s.home ?? null,
    awayScore: s.away ?? null,
    winner: match.score?.winner || null,
    status: match.status
  };
}

function updateElo(homeELO, awayELO, homeScore, awayScore) {
  if (homeScore === null || awayScore === null) return { homeELO, awayELO };
  const expectedHome = 1 / (1 + Math.pow(10, (awayELO - homeELO) / 400));
  const expectedAway = 1 - expectedHome;
  let homeResult, awayResult;
  if (homeScore > awayScore) { homeResult = 1; awayResult = 0; }
  else if (homeScore < awayScore) { homeResult = 0; awayResult = 1; }
  else { homeResult = 0.5; awayResult = 0.5; }
  const K = 32;
  return {
    homeELO: Math.round(homeELO + K * (homeResult - expectedHome)),
    awayELO: Math.round(awayELO + K * (awayResult - expectedAway))
  };
}

async function searchTeam(name) {
  const data = await api(`/teams?search=${encodeURIComponent(name)}`);
  return data.teams || [];
}

async function getTeamMatches(teamId, limit = 10) {
  const data = await api(`/teams/${teamId}/matches?limit=${limit}`);
  return data.matches || [];
}

async function analyzeMatch(homeName, awayName) {
  console.log(`\n🔍 Analizando: ${homeName} vs ${awayName}`);

  // Buscar equipos en la API
  const [homeTeams, awayTeams] = await Promise.all([
    searchTeam(homeName),
    searchTeam(awayName)
  ]);

  const homeTeam = homeTeams[0];
  const awayTeam = awayTeams.find(t =>
    t.name.toLowerCase().includes(awayName.toLowerCase()) ||
    awayName.toLowerCase().includes(t.name.toLowerCase())
  ) || awayTeams[0];

  if (!homeTeam || !awayTeam) {
    console.log(`  ✗ Equipos no encontrados en API`);
    console.log(`    Home found: ${homeTeams.map(t => t.name).join(', ') || 'none'}`);
    console.log(`    Away found: ${awayTeams.map(t => t.name).join(', ') || 'none'}`);
    return null;
  }

  console.log(`  ✓ ${homeTeam.name} (ID: ${homeTeam.id}) vs ${awayTeam.name} (ID: ${awayTeam.id})`);

  // Obtener últimos partidos de ambos equipos
  const [homeMatches, awayMatches] = await Promise.all([
    getTeamMatches(homeTeam.id, 10),
    getTeamMatches(awayTeam.id, 10)
  ]);

  // Extraer forma reciente (últimos 5)
  const homeForm = homeMatches
    .filter(m => m.status === 'FINISHED' && m.score?.fullTime?.home !== null)
    .slice(0, 5)
    .map(m => {
      const isHome = m.homeTeam?.id === homeTeam.id;
      const scoreH = m.score.fullTime.home;
      const scoreA = m.score.fullTime.away;
      if (isHome) return scoreH > scoreA ? 'W' : scoreH < scoreA ? 'L' : 'D';
      else return scoreA > scoreH ? 'W' : scoreA < scoreH ? 'L' : 'D';
    });

  const awayForm = awayMatches
    .filter(m => m.status === 'FINISHED' && m.score?.fullTime?.home !== null)
    .slice(0, 5)
    .map(m => {
      const isHome = m.homeTeam?.id === awayTeam.id;
      const scoreH = m.score.fullTime.home;
      const scoreA = m.score.fullTime.away;
      if (isHome) return scoreH > scoreA ? 'W' : scoreH < scoreA ? 'L' : 'D';
      else return scoreA > scoreH ? 'W' : scoreA < scoreH ? 'L' : 'D';
    });

  // Extraer H2H (partidos entre estos equipos)
  const h2h = [];
  const allRecent = [...homeMatches, ...awayMatches]
    .filter(m => m.status === 'FINISHED' && m.score?.fullTime?.home !== null);
  const seen = new Set();
  for (const m of allRecent) {
    const key = [m.homeTeam?.id, m.awayTeam?.id, m.utcDate].join('-');
    if (seen.has(key)) continue;
    seen.add(key);
    const isHome = m.homeTeam?.id === homeTeam.id;
    const isAway = m.awayTeam?.id === awayTeam.id;
    const isReverse = m.homeTeam?.id === awayTeam.id && m.awayTeam?.id === homeTeam.id;
    if ((isHome && isAway) || isReverse) {
      h2h.push([m.score.fullTime.home, m.score.fullTime.away]);
    }
  }

  // Estadísticas de goles
  const homeGoals = homeMatches
    .filter(m => m.status === 'FINISHED' && m.score?.fullTime?.home !== null)
    .slice(0, 10);
  const awayGoals = awayMatches
    .filter(m => m.status === 'FINISHED' && m.score?.fullTime?.home !== null)
    .slice(0, 10);

  let homeGf = 0, homeGa = 0, awayGf = 0, awayGa = 0;
  homeGoals.forEach(m => {
    const isHome = m.homeTeam?.id === homeTeam.id;
    homeGf += isHome ? m.score.fullTime.home : m.score.fullTime.away;
    homeGa += isHome ? m.score.fullTime.away : m.score.fullTime.home;
  });
  awayGoals.forEach(m => {
    const isHome = m.homeTeam?.id === awayTeam.id;
    awayGf += isHome ? m.score.fullTime.home : m.score.fullTime.away;
    awayGa += isHome ? m.score.fullTime.away : m.score.fullTime.home;
  });

  const homeAvgGF = homeGoals.length > 0 ? (homeGf / homeGoals.length) : 1.2;
  const homeAvgGA = homeGoals.length > 0 ? (homeGa / homeGoals.length) : 1.0;
  const awayAvgGF = awayGoals.length > 0 ? (awayGf / awayGoals.length) : 1.0;
  const awayAvgGA = awayGoals.length > 0 ? (awayGa / awayGoals.length) : 0.9;

  // ELO
  let homeELO = eloCache[homeTeam.id] || 1500;
  let awayELO = eloCache[awayTeam.id] || 1500;

  // Calcular ELO de partidos recientes
  const allFinished = [...homeMatches, ...awayMatches]
    .filter(m => m.status === 'FINISHED' && m.score?.fullTime?.home !== null);
  const eloSeen = new Set();
  for (const m of allFinished) {
    const key = [m.id, m.utcDate].join('-');
    if (eloSeen.has(key)) continue;
    eloSeen.add(key);
    const hId = m.homeTeam?.id;
    const aId = m.awayTeam?.id;
    const hScore = m.score.fullTime.home;
    const aScore = m.score.fullTime.away;
    if (hId === homeTeam.id || hId === awayTeam.id || aId === homeTeam.id || aId === awayTeam.id) {
      const hElo = eloCache[hId] || 1500;
      const aElo = eloCache[aId] || 1500;
      const updated = updateElo(hElo, aElo, hScore, aScore);
      eloCache[hId] = updated.homeELO;
      eloCache[aId] = updated.awayELO;
      if (hId === homeTeam.id) homeELO = updated.homeELO;
      if (aId === homeTeam.id) homeELO = updated.awayELO;
      if (hId === awayTeam.id) awayELO = updated.homeELO;
      if (aId === awayTeam.id) awayELO = updated.awayELO;
    }
  }

  eloCache[homeTeam.id] = homeELO;
  eloCache[awayTeam.id] = awayELO;

  const result = {
    home: homeTeam.name,
    away: awayTeam.name,
    homeForm,
    awayForm,
    h2h: h2h.slice(0, 5),
    homeELO,
    awayELO,
    homeAvgGF: Math.round(homeAvgGF * 100) / 100,
    homeAvgGA: Math.round(homeAvgGA * 100) / 100,
    awayAvgGF: Math.round(awayAvgGF * 100) / 100,
    awayAvgGA: Math.round(awayAvgGA * 100) / 100,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    source: 'football-data.org'
  };

  // Mostrar resultados
  console.log(`  📊 Forma ${homeTeam.name}: ${homeForm.join('-') || 'sin datos'}`);
  console.log(`  📊 Forma ${awayTeam.name}: ${awayForm.join('-') || 'sin datos'}`);
  console.log(`  📊 H2H: ${h2h.length > 0 ? h2h.map(h => `${h[0]}-${h[1]}`).join(', ') : 'sin datos'}`);
  console.log(`  📊 ELO: ${homeTeam.name}=${homeELO} | ${awayTeam.name}=${awayELO}`);
  console.log(`  📊 Goles: ${homeTeam.name} ${homeAvgGF}GF/${homeAvgGA}GA | ${awayTeam.name} ${awayAvgGF}GF/${awayAvgGA}GA`);
  console.log(`  📊 λ local estimado: ${Math.round((homeAvgGF + awayAvgGA) / 2 * 100) / 100}`);
  console.log(`  📊 λ visita estimado: ${Math.round((awayAvgGF + homeAvgGA) / 2 * 100) / 100}`);

  return result;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  🔮 APUESTA.IA — Extractor de Estadísticas        ║');
  console.log('╚════════════════════════════════════════════════════╝');

  if (SEARCH_HOME && !IS_UPDATE) {
    const result = await analyzeMatch(SEARCH_HOME, SEARCH_AWAY || '');
    if (result) {
      fs.writeFileSync(
        path.join(__dirname, 'ultimas-estadisticas.json'),
        JSON.stringify(result, null, 2)
      );
      console.log('\n💾 Estadísticas guardadas en ultimas-estadisticas.json');
    }
  } else if (IS_UPDATE) {
    console.log('\n📝 Actualizando todos los equipos de la BD...');
    const db = loadDB();
    const teams = new Set();
    db.matches.forEach(m => {
      teams.add(m.home);
      teams.add(m.away);
    });
    console.log(`   ${teams.size} equipos encontrados`);

    for (const team of teams) {
      try {
        const [found] = await searchTeam(team);
        if (found) {
          const matches = await getTeamMatches(found.id, 5);
          const form = matches
            .filter(m => m.status === 'FINISHED' && m.score?.fullTime?.home !== null)
            .slice(0, 5)
            .map(m => {
              const isHome = m.homeTeam?.id === found.id;
              const h = m.score.fullTime.home;
              const a = m.score.fullTime.away;
              if (isHome) return h > a ? 'W' : h < a ? 'L' : 'D';
              else return a > h ? 'W' : a < h ? 'L' : 'D';
            });
          console.log(`   ${team}: ${form.join('-') || 'sin datos'}`);
        }
      } catch (e) {
        console.log(`   ${team}: error (${e.message.substring(0, 50)})`);
      }
      // Rate limit: 10/minuto gratis
      await new Promise(r => setTimeout(r, 1000));
    }
  } else {
    console.log('\n💡 Uso:');
    console.log('   node scout-estadisticas.js "Toluca" "Tigres"');
    console.log('   node scout-estadisticas.js --update');
  }

  console.log('\n✅ Done');
}

main().catch(console.error);
