#!/usr/bin/env node
// APUESTA.IA — Extractor de odds desde Codere.mx
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const wait = ms => new Promise(r => setTimeout(r, ms));

async function extractCodereOdds() {
  console.log('🌐 Conectando a Codere.mx...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

  await page.goto('https://apuestas.codere.mx/es_MX', { timeout: 30000 }).catch(() => {});
  await wait(5000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log('=== CODERE.MX CONTENIDO ===');
  console.log(text.substring(0, 3000));

  await browser.close();
}

extractCodereOdds().catch(console.error);
