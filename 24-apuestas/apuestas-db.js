#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'apuestas-data.json');

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return { matches: [], predictions: [], sources: {} }; }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function normalizeName(n) {
  return (n || '').replace(/\+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function addMatch(data) {
  const db = loadDB();
  const home = normalizeName(data.home);
  const away = normalizeName(data.away);

  const exists = db.matches.some(m => {
    const mh = normalizeName(m.home);
    const ma = normalizeName(m.away);
    if (mh === home && ma === away && !m.result) return true;
    if (m.date && data.date && m.date === data.date) return true;
    return false;
  });

  if (exists) {
    return { status: 'exists' };
  }

  const match = {
    id: `m${Date.now()}`,
    home: home,
    away: away,
    league: data.league || '',
    date: data.date || new Date().toISOString(),
    venue: data.venue || '',
    home_odds: data.home_odds || null,
    draw_odds: data.draw_odds || null,
    away_odds: data.away_odds || null,
    source: data.source || 'manual',
    scraped_at: new Date().toISOString(),
    result: data.result || null,
    home_score: data.home_score || null,
    away_score: data.away_score || null,
    bet_status: data.bet_status || null,
    bet_amount: data.bet_amount || null,
    bet_odds: data.bet_odds || null,
    bet_recibo: data.bet_recibo || null,
    bet_selection: data.bet_selection || null
  };
  db.matches.push(match);
  saveDB(db);
  return match;
}

function addPrediction(data) {
  const db = loadDB();
  const pred = {
    id: `p${Date.now()}`,
    match_id: data.match_id || null,
    home: normalizeName(data.home),
    away: normalizeName(data.away),
    league: data.league || '',
    home_prob: data.home_prob,
    draw_prob: data.draw_prob,
    away_prob: data.away_prob,
    winner: data.winner,
    confidence: data.confidence,
    model: data.model || 'poisson-v1',
    agents_used: ['opencode', 'claude-code', 'gemini'],
    sources_used: data.sources || ['caliente.mx', 'codere.mx'],
    created_at: new Date().toISOString(),
    actual_result: null,
    was_correct: null
  };
  db.predictions.push(pred);
  saveDB(db);
  return pred;
}

function addResult(matchId, homeScore, awayScore) {
  const db = loadDB();
  const match = db.matches.find(m => m.id === matchId);
  if (!match) return { error: 'Match not found' };

  const result = homeScore > awayScore ? 'H' : homeScore < awayScore ? 'A' : 'D';
  match.result = result;
  match.home_score = homeScore;
  match.away_score = awayScore;

  db.predictions.forEach(p => {
    const mh = normalizeName(p.home);
    const ma = normalizeName(p.away);
    if (mh === normalizeName(match.home) && ma === normalizeName(match.away)) {
      p.actual_result = result;
      const isHomeWin = (p.winner === p.home || normalizeName(p.winner) === normalizeName(match.home)) && result === 'H';
      const isAwayWin = (p.winner === p.away || normalizeName(p.winner) === normalizeName(match.away)) && result === 'A';
      const isDraw = (p.winner === 'Empate' || p.winner === 'Draw' || normalizeName(p.winner) === 'empate') && result === 'D';
      p.was_correct = isHomeWin || isAwayWin || isDraw;
    }
  });

  saveDB(db);
  return { match, result };
}

function addSource(name, url, type) {
  const db = loadDB();
  db.sources[name] = { url, type, last_scraped: null, status: 'active', added_at: new Date().toISOString() };
  saveDB(db);
}

function getStats() {
  const db = loadDB();
  const preds = db.predictions.filter(p => p.was_correct !== null);
  const correct = preds.filter(p => p.was_correct === true).length;
  return {
    total_matches: db.matches.length,
    total_predictions: db.predictions.length,
    resolved_predictions: preds.length,
    correct_predictions: correct,
    accuracy: preds.length > 0 ? Math.round(correct / preds.length * 100) : null,
    active_sources: Object.keys(db.sources).length
  };
}

function exportTrainingData() {
  const db = loadDB();
  return db.predictions.filter(p => p.was_correct !== null).map(p => ({
    home: p.home,
    away: p.away,
    league: p.league,
    home_prob: p.home_prob,
    draw_prob: p.draw_prob,
    away_prob: p.away_prob,
    confidence: p.confidence,
    actual_result: p.actual_result,
    was_correct: p.was_correct
  }));
}

// CLI
if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'stats') {
    const s = getStats();
    console.log('📊 APUESTA.IA — Estadísticas');
    console.log(`   Partidos: ${s.total_matches} | Predicciones: ${s.total_predictions}`);
    console.log(`   Resueltas: ${s.resolved_predictions} | Correctas: ${s.correct_predictions}`);
    console.log(`   Precisión: ${s.accuracy !== null ? s.accuracy + '%' : 'N/A'}`);
    console.log(`   Fuentes: ${s.active_sources}`);
  } else if (cmd === 'list') {
    const db = loadDB();
    db.matches.forEach(m => {
      const status = m.bet_status === 'confirmed' ? '✅' : '⏳';
      const res = m.result ? ` ${m.home_score}-${m.away_score}` : '';
      console.log(`  ${status} ${m.home} vs ${m.away}${res} (${m.date || '?'})`);
    });
  } else if (cmd === 'add-source') {
    addSource(process.argv[3], process.argv[4], process.argv[5] || 'web');
    console.log(`Fuente "${process.argv[3]}" agregada`);
  } else if (cmd === 'add-result') {
    const id = process.argv[3];
    const homeScore = parseInt(process.argv[4]);
    const awayScore = parseInt(process.argv[5]);
    if (!id || isNaN(homeScore) || isNaN(awayScore)) {
      console.log('❌ Uso: node apuestas-db.js add-result <match_id> <home_score> <away_score>');
    } else {
      const res = addResult(id, homeScore, awayScore);
      if (res.error) {
        console.log(`❌ Error: ${res.error}`);
      } else {
        console.log(`✅ Resultado registrado: ${res.match.home.toUpperCase()} ${homeScore}-${awayScore} ${res.match.away.toUpperCase()} (Resultado implícito: ${res.result})`);
      }
    }
  } else if (cmd === 'clean') {
    const db = loadDB();
    const before = db.matches.length;
    const seen = new Set();
    db.matches = db.matches.filter(m => {
      const key = normalizeName(m.home) + '|' + normalizeName(m.away);
      if (seen.has(key) && !m.result) return false;
      if (!m.result) seen.add(key);
      return true;
    });
    saveDB(db);
    console.log(`Limpieza: ${before} → ${db.matches.length} partidos`);
  } else {
    console.log('🔮 Uso: node apuestas-db.js <comando>');
    console.log('   Comandos disponibles:');
    console.log('   stats                                      - Muestra las estadísticas de predicción.');
    console.log('   list                                       - Lista todos los partidos registrados.');
    console.log('   clean                                      - Limpia registros duplicados de partidos.');
    console.log('   add-source <nombre> <url> <tipo>          - Agrega una nueva fuente de datos.');
    console.log('   add-result <match_id> <goles_l> <goles_v>  - Registra marcador y actualiza predicciones.');
  }
}

module.exports = { addMatch, addPrediction, addResult, getStats, exportTrainingData, loadDB, normalizeName };