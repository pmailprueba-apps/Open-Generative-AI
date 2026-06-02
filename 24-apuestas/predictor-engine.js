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

// ─── DIXON-COLES ADJUSTMENT ──────────────────────────────────────────
function dixonColesAdjustment(lambdaH, lambdaA, rho, x, y) {
  if (x === 0 && y === 0) return 1 - (lambdaH * lambdaA * rho);
  if (x === 0 && y === 1) return 1 + (lambdaH * rho);
  if (x === 1 && y === 0) return 1 + (lambdaA * rho);
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

// ─── EXPECTED VALUE (EV) & KELLY CRITERION ────────────────────────────
function calculateEV(probDecimal, decimalOdds) {
  if (!decimalOdds || decimalOdds <= 1) return 0;
  return (probDecimal * decimalOdds) - 1;
}

function calculateKelly(probDecimal, decimalOdds, fraction = 0.25) { // Kelly fraccional (1/4)
  if (!decimalOdds || decimalOdds <= 1) return 0;
  const b = decimalOdds - 1;
  const p = probDecimal;
  const q = 1 - p;
  const kelly = (b * p - q) / b;
  return kelly > 0 ? (kelly * fraction) * 100 : 0; // return percentage
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

  // 7 & 8. Matriz de probabilidades Poisson con Ajuste Dixon-Coles
  const maxGoals = 6;
  const rho = -0.05; // Ajuste negativo estándar para sobredimensionar empates de bajo goleo
  let probHome = 0, probDraw = 0, probAway = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const baseHome = poissonProb(Math.max(lambdaHome, 0.1), h);
      const baseAway = poissonProb(Math.max(lambdaAway, 0.1), a);
      const dcFactor = dixonColesAdjustment(Math.max(lambdaHome, 0.1), Math.max(lambdaAway, 0.1), rho, h, a);
      
      const p = baseHome * baseAway * Math.max(0, dcFactor);
      
      if (h > a) probHome += p;
      else if (h === a) probDraw += p;
      else probAway += p;
    }
  }

  // 9. Análisis Risk-Neutral de Mercado (Valor Esperado)
  let homeEV = 0, drawEV = 0, awayEV = 0;
  let hasOdds = false;
  let marketHome = 0, marketDraw = 0, marketAway = 0;

  if (odds.caliente && odds.caliente.home) {
    hasOdds = true;
    marketHome = odds.caliente_mejorados?.home || odds.caliente.home;
    marketDraw = odds.caliente_mejorados?.draw || odds.caliente.draw;
    marketAway = odds.caliente_mejorados?.away || odds.caliente.away;
    
    // El modelo ya NO hace "blend" con el mercado. El modelo matemático DEBE ser
    // independiente para poder encontrar las discrepancias (ineficiencias) del mercado.
    // Solo calculamos el Expected Value (EV).
    const totalRawProb = probHome + probDraw + probAway;
    homeEV = calculateEV(probHome / totalRawProb, marketHome);
    drawEV = calculateEV(probDraw / totalRawProb, marketDraw);
    awayEV = calculateEV(probAway / totalRawProb, marketAway);
  }

  // 10. Normalizar a 100%
  const total = probHome + probDraw + probAway;
  // Guardar decimales originales para Kelly antes de redondear a 100
  const normHomeDec = probHome / total;
  const normDrawDec = probDraw / total;
  const normAwayDec = probAway / total;
  
  probHome = Math.round(normHomeDec * 100);
  probDraw = Math.round(normDrawDec * 100);
  probAway = 100 - probHome - probDraw;

  // 11. Evaluar calidad de datos — ¿tenemos info real de los equipos?
  const hasRealData = homeForm.length > 0 || awayForm.length > 0 || h2h.length > 0 ||
                      homeElo !== 1500 || awayElo !== 1500;
  const isGeneric = !hasRealData && homeElo === 1500 && awayElo === 1500;

  // 12. Determinar Apuesta de Valor (EV+) y Kelly Stake
  let betRecommendation = "NO APOSTAR (EV Negativo)";
  let targetTeam = "-";
  let targetProb = 0;
  let targetOdds = 0;
  let targetEV = 0;
  let kellyStake = 0;

  if (hasOdds && !isGeneric) {
    // Buscamos el EV más alto — solo con datos reales de equipos
    const evs = [
      { type: 'Local (1)', team: home, ev: homeEV, p: normHomeDec, odds: marketHome },
      { type: 'Empate (X)', team: 'Empate', ev: drawEV, p: normDrawDec, odds: marketDraw },
      { type: 'Visitante (2)', team: away, ev: awayEV, p: normAwayDec, odds: marketAway }
    ];
    evs.sort((a, b) => b.ev - a.ev);
    
    const bestBet = evs[0];
    if (bestBet.ev > 0.05) { // Umbral mínimo 5% EV
      targetTeam = bestBet.team;
      targetProb = Math.round(bestBet.p * 100);
      targetOdds = bestBet.odds;
      targetEV = bestBet.ev;
      kellyStake = calculateKelly(bestBet.p, bestBet.odds, 0.25);
      betRecommendation = bestBet.type;
    }
  } else if (hasOdds && isGeneric) {
    // Tenemos odds pero no datos de equipos — modo conservador
    betRecommendation = "DATOS INSUFICIENTES (sin estadísticas de equipos)";
  } else {
    // Sin odds, solo probabilidad matemática
    const maxProb = Math.max(probHome, probDraw, probAway);
    targetTeam = maxProb === probHome ? home : maxProb === probDraw ? 'Empate' : away;
    betRecommendation = maxProb === probHome ? 'Local (1)' : maxProb === probDraw ? 'Empate (X)' : 'Visitante (2)';
  }

  let confidence = Math.round(30 + (Math.max(probHome, probDraw, probAway) - 33) * 1.2);
  // Penalizar confianza si no hay datos reales de equipos
  if (isGeneric) confidence = Math.min(confidence, 35);
  const confidenceLabel = confidence >= 70 ? 'ALTA' : confidence >= 55 ? 'MEDIA' : 'BAJA';
  
  // Stake recomendado final
  let stakeRec = "0% (No apostar)";
  if (hasOdds && targetEV > 0.05 && !isGeneric) {
    stakeRec = `Kelly Fraccional (1/4): ${kellyStake.toFixed(2)}% del Bankroll`;
  } else if (hasOdds && targetEV > 0 && isGeneric) {
    stakeRec = "1% (EV+ pero sin datos de equipos — cautela máxima)";
  } else if (hasOdds && targetEV <= 0.05 && targetEV > 0) {
    stakeRec = "0.5% (EV marginal — riesgo alto)";
  } else if (!hasOdds) {
    stakeRec = isGeneric ? '0.5% (Solo Poisson, sin datos de equipos)' : '1-3% (Por confianza teórica)';
  }

  const result = {
    match: { home, away, league },
    prediction: {
      winner: targetTeam,
      home_prob: probHome,
      draw_prob: probDraw,
      away_prob: probAway,
      confidence: Math.min(confidence, 95),
      confidence_label: confidenceLabel,
      recommended_stake: stakeRec,
      expected_value: targetEV,
      bet_type: betRecommendation,
      reasoning: (function() {
        const r = [];
        r.push(`Dixon-Coles (Poisson ajustado): λ_local=${Math.max(lambdaHome, 0.1).toFixed(2)}, λ_visita=${Math.max(lambdaAway, 0.1).toFixed(2)}`);
        r.push(`ELO: ${home}=${homeElo} vs ${away}=${awayElo}`);
        r.push(`Ventaja localía: ${(homeAdvantage * 100 - 100).toFixed(0)}%`);
        if (h2h.length > 0) r.push(`${h2h.length} enfrentamientos previos analizados`);
        if (homeForm.length > 0) r.push(`Forma reciente local: ${homeFormStrength > 0.5 ? 'positiva' : 'negativa'}`);
        if (awayForm.length > 0) r.push(`Forma reciente visita: ${awayFormStrength > 0.5 ? 'positiva' : 'negativa'}`);
        if (injuries.length > 0) r.push(`${injuries.length} lesiones consideradas`);
        // Data quality warning
        if (isGeneric) {
          r.push(`⚠️  DATOS INSUFICIENTES: No hay estadísticas reales de estos equipos en la base de datos.`);
          r.push(`📡 Para obtener datos precisos, usa: node scout-estadisticas.js "${home}" "${away}"`);
        }
        // Odds status
        if (hasOdds && !isGeneric) {
          r.push(`📈 Mercado evaluado: Local=${marketHome}, Empate=${marketDraw}, Visita=${marketAway}`);
          if (targetEV > 0.05) {
            r.push(`✅ EV POSITIVO detectado: +${(targetEV * 100).toFixed(2)}% de retorno esperado sobre inversión.`);
            r.push(`⚖️  Criterio de Kelly aplicado para gestión estricta de riesgo.`);
          } else if (targetEV > 0) {
            r.push(`⚠️  EV marginal (+${(targetEV * 100).toFixed(2)}%) — el valor no compensa el riesgo.`);
          } else {
            r.push(`🛑 EV Negativo: Todos los mercados tienen valor esperado negativo. El modelo rechaza la apuesta.`);
          }
        } else if (hasOdds && isGeneric) {
          r.push(`⚠️  Hay odds pero sin datos de equipos — EV no es confiable.`);
        } else {
          r.push(`⚠️  Sin odds de mercado — solo probabilidad matemática teórica.`);
        }
        return r;
      })()
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
    console.log(`  📊 Probabilidades Matemáticas (Dixon-Coles):`);
    console.log(`     ${home}:     ${result.prediction.home_prob}%`);
    console.log(`     Empate:        ${result.prediction.draw_prob}%`);
    console.log(`     ${away}:     ${result.prediction.away_prob}%`);
    console.log('');
    console.log(`  🎯 DECISIÓN DEL MODELO: ${result.prediction.bet_type}`);
    if (result.prediction.expected_value > 0) {
        console.log(`  📈 Expected Value (EV): +${(result.prediction.expected_value * 100).toFixed(2)}%`);
    } else if (result.prediction.expected_value < 0 && result.prediction.winner === '-') {
        console.log(`  🛑 Expected Value (EV): NEGATIVO (Matemáticamente Inviable)`);
    }
    console.log(`  💰 Gestión Riesgo (Stake): ${result.prediction.recommended_stake}`);
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