#!/usr/bin/env node
// APUESTA.IA — Extractor de Estadísticas vía API-Football (Soporta Liga MX)
// Uso: node scout-estadisticas.js "Toluca" "Tigres"

const TOKEN = process.env.API_FOOTBALL_KEY || "a9ede5d41e5f849e6eb9f5a0207dc90d";
const BASE = "https://v3.football.api-sports.io";
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

async function api(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { "x-apisports-key": TOKEN }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.substring(0, 100)}`);
  }
  return res.json();
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
  // Priorizar equipos de México
  const mxTeams = data.response.filter(r => r.team.country === 'Mexico');
  if (mxTeams.length > 0) return mxTeams.map(r => r.team);
  return data.response.map(r => r.team) || [];
}

async function getTeamMatches(teamId) {
  // En la API, la temporada actual de Liga MX y otras suele registrarse como 2024 o 2023
  const res1 = await api(`/fixtures?team=${teamId}&season=2024`);
  let allMatches = res1.response || [];
  
  if (allMatches.length < 15) {
      const res2 = await api(`/fixtures?team=${teamId}&season=2023`);
      allMatches = [...allMatches, ...(res2.response || [])];
  }

  // Filtrar terminados y ordenar por fecha descendente
  return allMatches
    .filter(m => m.fixture.status.short === 'FT' || m.fixture.status.short === 'AET' || m.fixture.status.short === 'PEN')
    .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp);
}

async function analyzeMatch(homeName, awayName) {
  console.log(`\n🔍 Analizando: ${homeName} vs ${awayName}`);

  // Buscar equipos en la API
  const [homeTeams, awayTeams] = await Promise.all([
    searchTeam(homeName),
    searchTeam(awayName)
  ]);

  const homeTeam = homeTeams[0];
  const awayTeam = awayTeams[0];

  if (!homeTeam || !awayTeam) {
    console.log(`  ✗ Equipos no encontrados en API`);
    return null;
  }

  console.log(`  ✓ ${homeTeam.name} (ID: ${homeTeam.id}) vs ${awayTeam.name} (ID: ${awayTeam.id})`);

  // Obtener últimos partidos de ambos equipos
  const [homeMatches, awayMatches] = await Promise.all([
    getTeamMatches(homeTeam.id),
    getTeamMatches(awayTeam.id)
  ]);

  // Extraer forma reciente (últimos 5)
  const homeForm = homeMatches.slice(0, 5).map(m => {
    const isHome = m.teams.home.id === homeTeam.id;
    const scoreH = m.goals.home;
    const scoreA = m.goals.away;
    if (isHome) return scoreH > scoreA ? 'W' : scoreH < scoreA ? 'L' : 'D';
    else return scoreA > scoreH ? 'W' : scoreA < scoreH ? 'L' : 'D';
  });

  const awayForm = awayMatches.slice(0, 5).map(m => {
    const isHome = m.teams.home.id === awayTeam.id;
    const scoreH = m.goals.home;
    const scoreA = m.goals.away;
    if (isHome) return scoreH > scoreA ? 'W' : scoreH < scoreA ? 'L' : 'D';
    else return scoreA > scoreH ? 'W' : scoreA < scoreH ? 'L' : 'D';
  });

  // Extraer H2H
  const h2h = [];
  const seen = new Set();
  const allRecent = [...homeMatches, ...awayMatches];
  for (const m of allRecent) {
    const key = m.fixture.id;
    if (seen.has(key)) continue;
    seen.add(key);
    
    const isHome = m.teams.home.id === homeTeam.id;
    const isAway = m.teams.away.id === awayTeam.id;
    const isReverse = m.teams.home.id === awayTeam.id && m.teams.away.id === homeTeam.id;
    
    if ((isHome && isAway) || isReverse) {
      if (isHome && isAway) h2h.push([m.goals.home, m.goals.away]);
      else h2h.push([m.goals.away, m.goals.home]); // Siempre guardamos [LocalScore, VisitaScore]
    }
  }

  // Estadísticas de goles (últimos 10)
  const homeGoals = homeMatches.slice(0, 10);
  const awayGoals = awayMatches.slice(0, 10);

  let homeGf = 0, homeGa = 0, awayGf = 0, awayGa = 0;
  homeGoals.forEach(m => {
    const isHome = m.teams.home.id === homeTeam.id;
    homeGf += isHome ? m.goals.home : m.goals.away;
    homeGa += isHome ? m.goals.away : m.goals.home;
  });
  awayGoals.forEach(m => {
    const isHome = m.teams.home.id === awayTeam.id;
    awayGf += isHome ? m.goals.home : m.goals.away;
    awayGa += isHome ? m.goals.away : m.goals.home;
  });

  const homeAvgGF = homeGoals.length > 0 ? (homeGf / homeGoals.length) : 1.2;
  const homeAvgGA = homeGoals.length > 0 ? (homeGa / homeGoals.length) : 1.0;
  const awayAvgGF = awayGoals.length > 0 ? (awayGf / awayGoals.length) : 1.0;
  const awayAvgGA = awayGoals.length > 0 ? (awayGa / awayGoals.length) : 0.9;

  // ELO
  let homeELO = 1500;
  let awayELO = 1500;

  // Calcular ELO de partidos recientes en orden cronológico (inverso)
  const allFinished = [...homeMatches, ...awayMatches]
    .filter((value, index, self) => index === self.findIndex((t) => t.fixture.id === value.fixture.id))
    .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp); // Ascendente para procesar ELO histórico

  for (const m of allFinished) {
    const hId = m.teams.home.id;
    const aId = m.teams.away.id;
    const hScore = m.goals.home;
    const aScore = m.goals.away;
    
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
    source: 'api-football.com'
  };

  // Mostrar resultados
  console.log(`  📊 Forma ${homeTeam.name}: ${homeForm.join('-') || 'sin datos'}`);
  console.log(`  📊 Forma ${awayTeam.name}: ${awayForm.join('-') || 'sin datos'}`);
  console.log(`  📊 H2H: ${h2h.length > 0 ? h2h.map(h => `${h[0]}-${h[1]}`).join(', ') : 'sin datos'}`);
  console.log(`  📊 ELO Calculado: ${homeTeam.name}=${homeELO} | ${awayTeam.name}=${awayELO}`);
  console.log(`  📊 Goles PP (10 part): ${homeTeam.name} ${homeAvgGF}GF/${homeAvgGA}GA | ${awayTeam.name} ${awayAvgGF}GF/${awayAvgGA}GA`);

  return result;
}

async function main() {
  if (SEARCH_HOME && SEARCH_AWAY) {
    const result = await analyzeMatch(SEARCH_HOME, SEARCH_AWAY);
    if (result) {
      fs.writeFileSync(
        path.join(__dirname, 'ultimas-estadisticas.json'),
        JSON.stringify(result, null, 2)
      );
    }
  } else {
    console.log('\n💡 Uso: node scout-estadisticas.js "Toluca" "Tigres"');
  }
}

main().catch(console.error);
