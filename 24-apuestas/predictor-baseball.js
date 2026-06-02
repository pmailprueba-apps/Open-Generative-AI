#!/usr/bin/env node
// APUESTA.IA — Motor de Predicción para Béisbol
// Modelo: Log5 (Bill James) + ELO con margen de carreras
//
// Uso: node predictor-baseball.js --home "Yankees" --away "Dodgers" --odds "1.80,2.05"

const fs = require('fs');
const path = require('path');

// ─── LOG5 FORMULA (Bill James) ────────────────────────────────────────
function log5(winProbA, winProbB) {
  return (winProbA - winProbA * winProbB) / (winProbA + winProbB - 2 * winProbA * winProbB);
}

// ─── ELO CON MARGEN DE CARRERAS ───────────────────────────────────────
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateEloBaseball(hElo, aElo, hRuns, aRuns, k = 25) {
  const mov = Math.abs(hRuns - aRuns);
  const movMultiplier = Math.log(mov + 1) / Math.log(2.5);
  const expected = expectedScore(hElo, aElo);
  let hResult, aResult;
  if (hRuns > aRuns) { hResult = 1; aResult = 0; }
  else if (hRuns < aRuns) { hResult = 0; aResult = 1; }
  else { hResult = 0.5; aResult = 0.5; }
  return {
    homeELO: Math.round(hElo + k * movMultiplier * (hResult - expected)),
    awayELO: Math.round(aElo + k * movMultiplier * (aResult - (1 - expected)))
  };
}

// ─── MAIN PREDICTION ──────────────────────────────────────────────────
function predict(home, away, options = {}) {
  const hElo = parseFloat(options['home-elo']) || 1500;
  const aElo = parseFloat(options['away-elo']) || 1500;
  const hWinRate = parseFloat(options['home-winrate']) || 0.520;
  const aWinRate = parseFloat(options['away-winrate']) || 0.500;
  const homeAdvantage = 0.04; // 4% ventaja localía en MLB

  // Log5 con ajuste de ELO
  const eloExpected = expectedScore(hElo, aElo);
  const rawProb = log5(hWinRate, aWinRate);
  const probHome = rawProb * 0.6 + eloExpected * 0.4 + homeAdvantage;
  const probAway = 1 - probHome;

  // Carreras esperadas (MLB promedio ~4.5 por equipo)
  const hRuns = parseFloat(options['home-runs']) || 4.5;
  const aRuns = parseFloat(options['away-runs']) || 4.3;
  const totalRuns = hRuns + aRuns;
  const runDiff = hRuns - aRuns + 0.3; // ventaja localía en carreras

  // EV y Kelly
  const odds = options.odds || {};
  const calOdds = odds.caliente || {};
  let homeEV = 0, awayEV = 0;
  let recommendation = "NO APOSTAR (Sin odds)";

  if (calOdds.home) {
    homeEV = (probHome * calOdds.home) - 1;
    awayEV = (probAway * calOdds.away) - 1;
    const bestEV = Math.max(homeEV, awayEV);
    if (bestEV > 0.05) {
      const team = homeEV > awayEV ? home : away;
      const odds_ = homeEV > awayEV ? calOdds.home : calOdds.away;
      const prob = homeEV > awayEV ? probHome : probAway;
      const kelly = ((odds_ - 1) * prob - (1 - prob)) / (odds_ - 1);
      recommendation = `${team} (Moneyline) | EV: +${(bestEV*100).toFixed(2)}% | Kelly: ${(kelly * 0.25 * 100).toFixed(2)}%`;
    } else {
      const best = homeEV > awayEV ? `Local (${(homeEV*100).toFixed(1)}%)` : `Visita (${(awayEV*100).toFixed(1)}%)`;
      recommendation = `NO APOSTAR (EV negativo: ${best})`;
    }
  }

  return {
    match: { home, away, league: options.league || 'MLB', sport: 'baseball' },
    prediction: {
      home_win_prob: Math.round(probHome * 100),
      away_win_prob: Math.round(probAway * 100),
      winner: probHome > 0.5 ? home : away,
      expected_runs_home: Math.round(hRuns * 10) / 10,
      expected_runs_away: Math.round(aRuns * 10) / 10,
      expected_total: Math.round(totalRuns),
      run_differential: Math.round(runDiff * 10) / 10,
      recommendation,
      confidence: Math.round(Math.abs(probHome - 0.5) * 200 + 25),
      model: 'Log5 + ELO (Margin)',
      home_elo: hElo,
      away_elo: aElo
    },
    odds_used: odds,
    timestamp: new Date().toISOString()
  };
}

module.exports = { predict, updateEloBaseball, expectedScore, log5 };

// ─── CLI ──────────────────────────────────────────────────────────────
if (require.main === module) {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        let val = argv[++i];
        try { val = JSON.parse(val); } catch {}
        args[key] = val;
      }
    }
  }
  const result = predict(args.home || 'Yankees', args.away || 'Dodgers', args);
  console.log(JSON.stringify(result, null, 2));
}
