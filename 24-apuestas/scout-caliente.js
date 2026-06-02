#!/usr/bin/env node
// APUESTA.IA — Extractor de odds reales desde Caliente.mx
// Usa puppeteer-extra con stealth plugin para bypass Cloudflare
//
// Uso: node scout-caliente.js                    (extrae todos los partidos)
//      node scout-caliente.js "Toluca" "Tigres"  (busca partido específico)
//      node scout-caliente.js --update            (actualiza apuestas-data.json)

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());
const wait = ms => new Promise(r => setTimeout(r, ms));

const SEARCH_HOME = process.argv[2];
const SEARCH_AWAY = process.argv[3];
const IS_UPDATE = process.argv[2] === '--update';
const DB_PATH = path.join(__dirname, 'apuestas-data.json');

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return { matches: [], predictions: [] }; }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

async function extractOdds() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  🔮 SCOUT CALIENTE — Odds en Tiempo Real      ║');
  console.log('╚════════════════════════════════════════════════╝');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );

  console.log('\n🌐 Conectando a Caliente.mx...');
  await page.goto('https://sports.caliente.mx/es_MX/Futbol', { timeout: 45000 }).catch(() => {});
  await wait(6000);

  console.log('📊 Extrayendo odds...');

  const matches = await page.evaluate(() => {
    const groups = [];
    // Find all match groups (3 buttons = 1 match: local, empate, visita)
    const allButtons = document.querySelectorAll('button.price');

    let currentMatch = { home: null, draw: null, away: null };
    let count = 0;

    allButtons.forEach(btn => {
      const text = btn.textContent.trim();
      const span = btn.querySelector('span.price.dec');
      const odds = span ? parseFloat(span.textContent.trim()) : null;
      const teamName = text.replace(/★/g, '').trim().split('\n')[0]?.trim();

      if (!teamName || !odds) return;

      // Detect if this is a team name or "Empate"
      if (teamName === 'Empate') {
        currentMatch.draw = odds;
      } else if (currentMatch.home === null) {
        currentMatch.home = { team: teamName, odds };
      } else if (currentMatch.away === null && teamName !== currentMatch.home.team) {
        currentMatch.away = { team: teamName, odds };
      }

      // When we have all 3, save and reset
      if (currentMatch.home && currentMatch.draw && currentMatch.away) {
        if (currentMatch.home.team && currentMatch.away.team) {
          groups.push({
            home: currentMatch.home.team,
            away: currentMatch.away.team,
            home_odds: currentMatch.home.odds,
            draw_odds: currentMatch.draw,
            away_odds: currentMatch.away.odds,
            source: 'caliente.mx',
            scraped_at: new Date().toISOString()
          });
        }
        currentMatch = { home: null, draw: null, away: null };
        count++;
      }
    });

    return groups;
  });

  console.log(`\n✅ ${matches.length} partidos encontrados con odds reales\n`);

  // Filter if searching for specific team
  let filtered = matches;
  if (SEARCH_HOME && !IS_UPDATE) {
    const h = SEARCH_HOME.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');
    const a = (SEARCH_AWAY || '').toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');
    filtered = matches.filter(m => {
      const mh = m.home.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');
      const ma = m.away.toLowerCase().replace(/[^a-z0-9áéíóúñ]/g, '');
      return mh.includes(h) || ma.includes(h) || mh.includes(a) || ma.includes(a);
    });
    if (filtered.length === 0) {
      // Try partial name matching (e.g., "Mex" matches "Mexico")
      filtered = matches.filter(m =>
        m.home.toLowerCase().includes(SEARCH_HOME.substring(0,4).toLowerCase()) ||
        m.away.toLowerCase().includes(SEARCH_HOME.substring(0,4).toLowerCase()) ||
        m.home.toLowerCase().includes((SEARCH_AWAY || '').substring(0,4).toLowerCase()) ||
        m.away.toLowerCase().includes((SEARCH_AWAY || '').substring(0,4).toLowerCase())
      );
    }
    console.log(`🔍 Buscando: ${SEARCH_HOME} vs ${SEARCH_AWAY || '?'} → ${filtered.length} resultados`);
  }

  // Display results
  filtered.slice(0, 20).forEach((m, i) => {
    console.log(`${i + 1}. ${m.home} vs ${m.away}`);
    console.log(`   1) ${m.home_odds.toFixed(2)}  X) ${m.draw_odds.toFixed(2)}  2) ${m.away_odds.toFixed(2)}`);
  });

  if (filtered.length > 20) {
    console.log(`   ... y ${filtered.length - 20} más`);
  }

  // Save all matches to JSON for reference
  fs.writeFileSync(
    path.join(__dirname, 'ultimos-odds-caliente.json'),
    JSON.stringify(matches, null, 2)
  );
  console.log(`\n💾 Todos los odds guardados en ultimos-odds-caliente.json`);

  // Update database if --update flag
  if (IS_UPDATE) {
    console.log('\n📝 Actualizando base de datos...');
    const db = loadDB();

    for (const match of matches) {
      const existing = db.matches.find(m =>
        m.home.toLowerCase() === match.home.toLowerCase() &&
        m.away.toLowerCase() === match.away.toLowerCase()
      );
      if (existing) {
        existing.home_odds = match.home_odds;
        existing.draw_odds = match.draw_odds;
        existing.away_odds = match.away_odds;
        existing.scraped_at = match.scraped_at;
        existing.source = 'caliente.mx';
      } else {
        db.matches.push({
          id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          ...match,
          result: null,
          home_score: null,
          away_score: null,
          bet_status: null,
          bet_amount: null,
          bet_odds: null,
          bet_recibo: null,
          bet_selection: null
        });
      }
    }
    saveDB(db);
    console.log(`✅ Base de datos actualizada con ${matches.length} partidos`);
  }

  await browser.close();
  return filtered;
}

extractOdds().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
