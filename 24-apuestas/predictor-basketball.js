#!/usr/bin/env node
// APUESTA.IA — Motor de Predicción para Básquetbol
// Modelo: Distribución Normal para diferencial de puntos + ELO con margen
//
// Uso: node predictor-basketball.js --home "Lakers" --away "Celtics" --odds "1.90,1.90"

const fs = require('fs');
const path = require('path');

// ─── ELO CON MARGEN DE VICTORIA ───────────────────────────────────────
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateEloBasketball(hElo, aElo, hScore, aScore, k = 35) {
  const mov = Math.abs(hScore - aScore);
  const movMultiplier = Math.log(mov + 1) / Math.log(3); // Margen ajustado
  const expected = expectedScore(hElo, aElo);
  let hResult, aResult;
  if (hScore > aScore) { hResult = 1; aResult = 0; }
  else if (hScore < aScore) { hResult = 0; aResult = 1; }
  else { hResult = 0.5; aResult = 0.5; }
  const kAdj = k * movMultiplier;
  return {
    homeELO: Math.round(hElo + kAdj * (hResult - expected)),
    awayELO: Math.round(aElo + kAdj * (aResult - (1 - expected)))
  };
}

// ─── DISTRIBUCIÓN NORMAL ──────────────────────────────────────────────
function normalCDF(x, mean = 0, std = 11.5) {
  return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
}

function erf(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// ─── MAIN PREDICTION ──────────────────────────────────────────────────
function predict(home, away, options = {}) {
  const hElo = parseFloat(options['home-elo']) || 1500;
  const aElo = parseFloat(options['away-elo']) || 1500;
  const homeScoring = parseFloat(options['home-scoring']) || 110;
  const awayScoring = parseFloat(options['away-scoring']) || 108;
  const homeAllowed = parseFloat(options['home-allowed']) || 107;
  const awayAllowed = parseFloat(options['away-allowed']) || 106;

  // Diferencial esperado
  const homeOffense = homeScoring - awayAllowed;
  const awayOffense = awayScoring - homeAllowed;
  const homeAdvantage = 2.5; // Puntos de ventaja localía en NBA
  const spreadExpected = homeOffense - awayOffense + homeAdvantage;

  // Desviación estándar típica en NBA
  const stdDev = 11.5;

  // Probabilidades moneyline 1X2 (adaptado)
  const probHome = normalCDF(0, spreadExpected, stdDev);
  const probAway = 1 - probHome;
  
  // Probabilidad de cubrir el spread (-3, -5, etc.)
  function probCover(spread) {
    return normalCDF(spread, spreadExpected, stdDev);
  }
  
  // Probabilidades para over/under
  const totalExpected = homeScoring + awayAllowed + awayScoring + homeAllowed / 2;
  function probOver(line) {
    return 1 - normalCDF(line, totalExpected, stdDev * 1.5);
  }

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
      const kelly = (odds_ - 1) * (homeEV > awayEV ? probHome : probAway) - (1 - (homeEV > awayEV ? probHome : probAway));
      recommendation = `${team} (Moneyline) | EV: ${(bestEV*100).toFixed(2)}% | Kelly: ${(kelly * 0.25 * 100).toFixed(2)}%`;
    }
  }

  return {
    match: { home, away, league: options.league || 'NBA', sport: 'basketball' },
    prediction: {
      home_win_prob: Math.round(probHome * 100),
      away_win_prob: Math.round(probAway * 100),
      spread_expected: Math.round(spreadExpected * 10) / 10,
      total_expected: Math.round(totalExpected),
      winner: probHome > 0.5 ? home : away,
      recommendation,
      confidence: Math.round(Math.abs(probHome - 0.5) * 200 + 30),
      model: 'Normal Distribution + ELO (MOV)',
      home_elo: hElo,
      away_elo: aElo,
      home_ppg: homeScoring,
      away_ppg: awayScoring,
      home_oppg: homeAllowed,
      away_oppg: awayAllowed
    },
    odds_used: odds,
    timestamp: new Date().toISOString()
  };
}

module.exports = { predict, updateEloBasketball, expectedScore, normalCDF };

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
  const result = predict(args.home || 'Lakers', args.away || 'Celtics', args);
  console.log(JSON.stringify(result, null, 2));
}
