#!/usr/bin/env node
/**
 * APUESTA.IA — Motor de Predicción Deportiva
 * Modelo: Distribución Poisson para predicción de goles + ELO para rating
 * 
 * Uso: node predictor-engine.js --home "PSG" --away "Arsenal" [opciones]
 * 
 * Opciones:
 *   --home       Equipo local
 *   --away       Equipo visitante
 *   --league     Liga (opcional)
 *   --h2h        JSON con historial H2H: [[goles_local, goles_visita], ...]
 *   --home-form  JSON con últimos resultados local: ["W","D","L","W","W"]
 *   --away-form  JSON con últimos resultados visita
 *   --home-elo   Rating ELO local (default: 1500)
 *   --away-elo   Rating ELO visita (default: 1500)
 *   --injuries   JSON con lesiones: [{team, player, impact}]
 *   --odds       JSON con momios: {caliente: {home, draw, away}}
 *   --json       Output en JSON
 */

const fs = require('fs');
const path = require('path');
const { randomBytes, scryptSync } = require('crypto');

// ─── PARSE ARGUMENTS ──────────────────────────────────────────────────
function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        let val = argv[++i];
        try { val = JSON.parse(val); } catch {}
        args[key] = val;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

// ─── POISSON DISTRIBUTION ─────────────────────────────────────────────
function poissonProb(lambda, k) {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// ─── ELO RATING SYSTEM ────────────────────────────────────────────────
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateElo(winner, loser, k = 32) {
  const expected = expectedScore(winner, loser);
  return {
    winner: winner + k * (1 - expected),
    loser: loser + k * (0 - (1 - expected))
  };
}

// ─── FORM TO STRENGTH ─────────────────────────────────────────────────
function formStrength(results) {
  if (!results || results.length === 0) return 0;
  const weights = { 'W': 1, 'D': 0.5, 'L': 0, 'w': 1, 'd': 0.5, 'l': 0 };
  // Recent results weighted more
  let total = 0, sum = 0;
  results.forEach((r, i) => {
    const w = (i + 1) / results.length; // more recent = higher weight
    total += (weights[r] || 0) * w;
    sum += w;
  });
  return sum > 0 ? total / sum : 0;
}

// ─── MAIN PREDICTION ENGINE ───────────────────────────────────────────
function predict(home, away, options = {}) {
  const league = options.league || 'UEFA Champions League';
  const h2h = options.h2h || [];
  const homeForm = options['home-form'] || [];
  const awayForm = options['away-form'] || [];
  const homeElo = parseFloat(options['home-elo']) || 1500;
  const awayElo = parseFloat(options['away-elo']) || 1500;
  const injuries = options.injuries || [];
  const odds = options.odds || {};

  // 1. Calcular fuerza de ataque/defensa desde ELO
  const eloAdvantage = expectedScore(homeElo, awayElo);
  const homeAttack = eloAdvantage * 1.2;
  const awayAttack = (1 - eloAdvantage) * 1.1;

  // 2. Factor forma reciente
  const homeFormStrength = formStrength(homeForm);
  const awayFormStrength = formStrength(awayForm);
  const formFactorHome = 0.8 + (homeFormStrength * 0.4);
  const formFactorAway = 0.8 + (awayFormStrength * 0.4);

  // 3. Factor localía
  const homeAdvantage = 1.15;

  // 4. Factor lesiones
  let homeInjuryPenalty = 0;
  let awayInjuryPenalty = 0;
  injuries.forEach(inj => {
    if (inj.team && inj.team.toLowerCase() === home.toLowerCase()) {
      homeInjuryPenalty += (inj.impact || 0.5) * 0.15;
    }
    if (inj.team && inj.team.toLowerCase() === away.toLowerCase()) {
      awayInjuryPenalty += (inj.impact || 0.5) * 0.15;
    }
  });

  // 5. Factor H2H histórico
  let h2hHomeGoals = 0, h2hAwayGoals = 0;
  if (h2h.length > 0) {
    h2h.forEach(m => {
      h2hHomeGoals += m[0];
      h2hAwayGoals += m[1];
    });
    h2hHomeGoals /= h2h.length;
    h2hAwayGoals /= h2h.length;
  }
  const h2hFactor = h2h.length > 0 ? {
    home: 0.9 + (h2hHomeGoals / (h2hHomeGoals + h2hAwayGoals || 1)) * 0.2,
    away: 0.9 + (h2hAwayGoals / (h2hHomeGoals + h2hAwayGoals || 1)) * 0.2
  } : { home: 1, away: 1 };

  // 6. Goles esperados (lambda)
  const lambdaHome = 1.2 * homeAttack * formFactorHome * homeAdvantage * h2hFactor.home - homeInjuryPenalty;
  const lambdaAway = 0.9 * awayAttack * formFactorAway * h2hFactor.away - awayInjuryPenalty;

  // 7. Matriz de probabilidades Poisson (hasta 6 goles)
  const maxGoals = 6;
  const homeProbs = [];
  const awayProbs = [];
  for (let i = 0; i <= maxGoals; i++) {
    homeProbs.push(poissonProb(Math.max(lambdaHome, 0.1), i));
    awayProbs.push(poissonProb(Math.max(lambdaAway, 0.1), i));
  }

  // 8. Calcular 1X2
  let probHome = 0, probDraw = 0, probAway = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = homeProbs[h] * awayProbs[a];
      if (h > a) probHome += p;
      else if (h === a) probDraw += p;
      else probAway += p;
    }
  }

  // 9. Ajustar por odds de casa de apuesta (si están disponibles)
  if (odds.caliente && odds.caliente.home) {
    // Usar mejores odds disponibles (normal o mejorados)
    const bestHome = odds.caliente_mejorados?.home || odds.caliente.home;
    const bestDraw = odds.caliente_mejorados?.draw || odds.caliente.draw;
    const bestAway = odds.caliente_mejorados?.away || odds.caliente.away;
    
    const impliedHome = 1 / bestHome;
    const impliedDraw = 1 / bestDraw;
    const impliedAway = 1 / bestAway;
    const margin = impliedHome + impliedDraw + impliedAway;
    
    // Blend: 70% modelo, 30% mercado
    probHome = probHome * 0.7 + (impliedHome / margin) * 0.3;
    probDraw = probDraw * 0.7 + (impliedDraw / margin) * 0.3;
    probAway = probAway * 0.7 + (impliedAway / margin) * 0.3;
  }

  // 10. Normalizar a 100%
  const total = probHome + probDraw + probAway;
  probHome = Math.round((probHome / total) * 100);
  probDraw = Math.round((probDraw / total) * 100);
  probAway = 100 - probHome - probDraw;

  // 11. Determinar ganador y confianza
  const maxProb = Math.max(probHome, probDraw, probAway);
  const winner = maxProb === probHome ? home : maxProb === probDraw ? 'Empate' : away;
  const confidence = Math.round(30 + (maxProb - 33) * 1.2);
  const confidenceLabel = confidence >= 70 ? 'ALTA' : confidence >= 55 ? 'MEDIA' : 'BAJA';
  const stakeRec = confidence >= 70 ? 'Moderado (3-5%)' : confidence >= 55 ? 'Conservador (1-3%)' : 'Mínimo (0.5-1%)';

  const result = {
    match: { home, away, league },
    prediction: {
      winner,
      home_prob: probHome,
      draw_prob: probDraw,
      away_prob: probAway,
      confidence: Math.min(confidence, 95),
      confidence_label: confidenceLabel,
      recommended_stake: stakeRec,
      bet_type: winner === home ? `Local (1)` : winner === away ? `Visitante (2)` : 'Empate (X)',
      reasoning: [
        `Modelo Poisson: λ_local=${Math.max(lambdaHome, 0.1).toFixed(2)} goles esperados`,
        `λ_visita=${Math.max(lambdaAway, 0.1).toFixed(2)} goles esperados`,
        `ELO: ${home}=${homeElo} vs ${away}=${awayElo}`,
        `Ventaja localía: ${(homeAdvantage * 100 - 100).toFixed(0)}%`,
        h2h.length > 0 ? `${h2h.length} enfrentamientos previos analizados` : 'Sin datos H2H',
        `Forma reciente: ${homeFormStrength > 0.5 ? 'positiva' : 'negativa'} (local)`,
        `Forma reciente: ${awayFormStrength > 0.5 ? 'positiva' : 'negativa'} (visita)`,
        injuries.length > 0 ? `${injuries.length} lesiones consideradas` : 'Sin lesiones reportadas'
      ].filter(Boolean)
    },
    model: {
      lambda_home: Math.max(lambdaHome, 0.1),
      lambda_away: Math.max(lambdaAway, 0.1),
      elo_home: homeElo,
      elo_away: awayElo,
      home_attack_factor: homeAttack,
      away_attack_factor: awayAttack,
      form_factor_home: formFactorHome,
      form_factor_away: formFactorAway,
      home_advantage: homeAdvantage,
      injury_penalty_home: homeInjuryPenalty,
      injury_penalty_away: awayInjuryPenalty
    },
    odds_used: odds,
    timestamp: new Date().toISOString(),
    agents: {
      scout: 'opencode',
      analyst: 'claude-code',
      predictor: 'gemini'
    }
  };

  return result;
}

// ─── CLI INTERFACE ─────────────────────────────────────────────────────
if (require.main === module) {
  const args = parseArgs();
  const home = args.home || 'PSG';
  const away = args.away || 'Arsenal';

  // Try to load existing data from last run
  const dataFile = process.env.DATA_FILE || path.join(__dirname, 'datos_partido.json');
  let savedData = {};
  try {
    savedData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  } catch {}

  // Merge CLI args with saved data
  const options = { ...savedData, ...args };

  const result = predict(home, away, options);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║      🔮 APUESTA.IA — PREDICCIÓN DEL MODELO POISSON     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Partido:    ${home} vs ${away}`);
    console.log(`  Liga:       ${options.league || 'UEFA Champions League'}`);
    console.log('');
    console.log(`  📊 Probabilidades calculadas:`);
    console.log(`     ${home}:     ${result.prediction.home_prob}%`);
    console.log(`     Empate:        ${result.prediction.draw_prob}%`);
    console.log(`     ${away}:     ${result.prediction.away_prob}%`);
    console.log('');
    console.log(`  🏆 GANADOR: ${result.prediction.winner}`);
    console.log(`  🎯 Confianza: ${result.prediction.confidence}% (${result.prediction.confidence_label})`);
    console.log(`  💰 Stake: ${result.prediction.recommended_stake}`);
    console.log('');
    console.log('  📋 Factores del modelo:');
    result.prediction.reasoning.forEach(r => console.log(`     • ${r}`));
    console.log('');
    console.log('  🤖 Agentes involucrados:');
    console.log(`     Scout    → opencode   (extracción de datos)`);
    console.log(`     Analyst  → claude-code (análisis estadístico)`);
    console.log(`     Predictor→ gemini     (predicción final)`);
    console.log('');
    console.log(`  💾 Datos guardados en ultima_prediccion.json`);
  }

  // Save prediction
  const predPath = process.env.PRED_FILE || path.join(__dirname, 'ultima_prediccion.json');
  fs.writeFileSync(predPath, JSON.stringify(result, null, 2));
}

module.exports = { predict, poissonProb, expectedScore, formStrength };