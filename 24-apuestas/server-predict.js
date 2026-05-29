#!/usr/bin/env node
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { predict } = require('./predictor-engine.js');
const { addMatch, addPrediction, loadDB, getStats, normalizeName } = require('./apuestas-db.js');

const PORT = 3456;
const DATA_FILE = path.join(__dirname, 'datos_partido.json');
const PRED_FILE = path.join(__dirname, 'ultima_prediccion.json');

function loadData() {
 try {
 const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
 delete d._instrucciones; delete d._ejemplo;
 return d;
 } catch { return {}; }
}

function send(res, data, status = 200) {
 res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
 res.end(JSON.stringify(data, null, 2));
}

function sendHTML(res, html, status = 200) {
 res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
 res.end(html);
}

function parseURL(url) {
 const [pathname, qs] = url.split('?');
 const params = {};
 if (qs) qs.split('&').forEach(p => { const [k, v] = p.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
 return { pathname, params };
}

function readBody(req, cb) {
 let body = '';
 req.on('data', c => body += c);
 req.on('end', () => { try { cb(JSON.parse(body)); } catch (e) { cb(null, e); } });
}

const server = http.createServer((req, res) => {
 try {
 const { pathname, params } = parseURL(req.url);
 const method = req.method;

 if (method === 'OPTIONS') {
 res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
 return res.end();
 }

 // GET /health
 if (pathname === '/health' && method === 'GET') {
 return send(res, { status: 'ok', service: 'APUESTA.IA', agents: ['opencode', 'claude-code', 'gemini'], timestamp: new Date().toISOString() });
 }

 // GET /last — última predicción
 if (pathname === '/last' && method === 'GET') {
 try { return send(res, JSON.parse(fs.readFileSync(PRED_FILE, 'utf-8'))); }
 catch { return send(res, { error: 'No predictions yet' }, 404); }
 }

 // GET /predict — consulta rápida (NO guarda en DB)
 if (pathname === '/predict' && method === 'GET') {
 const home = params.home || 'PSG';
 const away = params.away || 'Arsenal';
 const options = { ...loadData(), ...params };
 const result = predict(home, away, options);
 fs.writeFileSync(PRED_FILE, JSON.stringify(result, null, 2));
 return send(res, result);
 }

 // POST /data — Scout sube datos
 if (pathname === '/data' && method === 'POST') {
 return readBody(req, (body, err) => {
 if (err) return send(res, { error: 'Invalid JSON' }, 400);
 const current = loadData();
 const merged = { ...current, ...body };
 fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));
 send(res, { status: 'stored', agent: 'Scout', fields: Object.keys(body) });
 });
 }

 // POST /analyze — Analyst analiza
 if (pathname === '/analyze' && method === 'POST') {
 return readBody(req, (body, err) => {
 if (err) return send(res, { error: 'Invalid JSON' }, 400);
 const home = body.home || 'PSG';
 const away = body.away || 'Arsenal';
 const options = { ...loadData(), ...body };
 const result = predict(home, away, options);
 send(res, { agent: 'Analyst', match: { home, away }, probabilities: { home: result.prediction.home_prob, draw: result.prediction.draw_prob, away: result.prediction.away_prob } });
 });
 }

 // POST /predict-final — Predictor guarda predicción final
 if (pathname === '/predict-final' && method === 'POST') {
 return readBody(req, (body, err) => {
 if (err) return send(res, { error: 'Invalid JSON' }, 400);
 const home = body.home || 'PSG';
 const away = body.away || 'Arsenal';
 const options = { ...loadData(), ...body };
 const result = predict(home, away, options);
 fs.writeFileSync(PRED_FILE, JSON.stringify(result, null, 2));

 addMatch({
 home, away, league: result.match.league,
 date: body.date || new Date().toISOString(),
 home_odds: result.odds_used?.caliente?.home || null,
 draw_odds: result.odds_used?.caliente?.draw || null,
 away_odds: result.odds_used?.caliente?.away || null,
 source: 'predictor',
 bet_status: body.bet_status || null,
 bet_amount: body.bet_amount || null,
 bet_odds: body.bet_odds || null,
 bet_recibo: body.bet_recibo || null,
 bet_selection: body.bet_selection || null
 });

 send(res, result);
 });
 }

 // GET / o /dashboard — HTML Premium e interactivo con Inyección de Datos Reales de apuestas-db.js
 if ((pathname === '/' || pathname === '/dashboard') && method === 'GET') {
 const db = loadDB();
 const stats = getStats();
 const confirmed = db.matches.filter(m => m.bet_status === 'confirmed');

 let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

 // 1. Construir e Inyectar Estadísticas y Apuestas en Vivo
 const dynamicStatsAndBets = `
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
 <!-- Stats Card -->
 <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.25rem;">
 <h3 style="font-size: 0.85rem; color: var(--neon-cyan); margin-bottom: 0.75rem; font-weight: 800; border-bottom: 1px dashed rgba(0,240,255,0.2); padding-bottom: 0.5rem; letter-spacing: 0.5px;"> ESTADISTICAS DEL MOTOR</h3>
 <div style="display:flex; justify-content:space-between; padding: 0.35rem 0; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.02);"><span style="color:var(--text-secondary)">Partidos Analizados:</span><strong style="color:#fff">${stats.total_matches}</strong></div>
 <div style="display:flex; justify-content:space-between; padding: 0.35rem 0; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.02);"><span style="color:var(--text-secondary)">Predicciones Totales:</span><strong style="color:#fff">${stats.total_predictions}</strong></div>
 <div style="display:flex; justify-content:space-between; padding: 0.35rem 0; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.02);"><span style="color:var(--text-secondary)">Precisión de Inferencia:</span><strong style="color:var(--neon-green)">${stats.accuracy !== null ? stats.accuracy + '%' : 'Pendiente'}</strong></div>
 <div style="display:flex; justify-content:space-between; padding: 0.35rem 0; font-size: 0.85rem;"><span style="color:var(--text-secondary)">Fuentes de Datos:</span><strong style="color:var(--neon-cyan)">${stats.active_sources} Activas</strong></div>
 </div>

 <!-- Active Bets Card -->
 <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.25rem;">
 <h3 style="font-size: 0.85rem; color: var(--neon-green); margin-bottom: 0.75rem; font-weight: 800; border-bottom: 1px dashed rgba(0,255,102,0.2); padding-bottom: 0.5rem; letter-spacing: 0.5px;">BANCA Y APUESTAS</h3>
 ${confirmed.length > 0 ? confirmed.map(m => `
 <div style="display:flex; justify-content:space-between; padding: 0.25rem 0; font-size: 0.85rem;"><span style="color:#fff; font-weight:600;">${m.home.toUpperCase()} vs ${m.away.toUpperCase()}</span><strong style="color:var(--neon-green)">$${m.bet_amount}</strong></div>
 <div style="font-size: 0.75rem; color: var(--text-muted); display:flex; justify-content:space-between; padding-bottom: 0.35rem; border-bottom: 1px solid rgba(255,255,255,0.02);"><span>Recibo #${m.bet_recibo} | ${m.bet_selection} @ ${m.bet_odds}</span><span>Retorno: $${Math.round(m.bet_amount * m.bet_odds)}</span></div>
 `).join('') : '<div style="color: var(--text-muted); font-size: 0.75rem; text-align:center; padding: 1.5rem 0;">Sin apuestas de banca activas hoy.</div>'}
 </div>
</div>`;

 // 2. Construir e Inyectar Tabla de Historial
 const dynamicPredictionsTable = `
<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; color: var(--text-secondary);">
 <thead>
 <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">
 <th style="padding: 1rem 0.5rem;">Partido</th>
 <th style="padding: 1rem 0.5rem;">Pronóstico</th>
 <th style="padding: 1rem 0.5rem;">Confianza</th>
 <th style="padding: 1rem 0.5rem;">Resultado Inferencia</th>
 </tr>
 </thead>
 <tbody>
 ${db.predictions.length > 0 ? db.predictions.map(p => `
 <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.02); transition: background 0.2s;">
 <td style="padding: 0.85rem 0.5rem; font-weight: 600; color: #fff;">${p.home} vs ${p.away}</td>
 <td style="padding: 0.85rem 0.5rem; font-weight: 700; color: var(--neon-cyan);">${p.winner}</td>
 <td style="padding: 0.85rem 0.5rem; font-family: monospace; font-size: 0.9rem;">${p.confidence}%</td>
 <td style="padding: 0.85rem 0.5rem;">
 ${p.was_correct === null ? 
 `<span style="display:inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; background: rgba(255, 159, 28, 0.1); color: #ff9f1c; border: 1px solid rgba(255, 159, 28, 0.25);">PENDIENTE</span>` : 
 p.was_correct ? 
 `<span style="display:inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; background: rgba(0, 255, 102, 0.1); color: #00ff66; border: 1px solid rgba(0, 255, 102, 0.25);">CORRECTA </span>` : 
 `<span style="display:inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; background: rgba(255, 51, 102, 0.1); color: #ff3366; border: 1px solid rgba(255, 51, 102, 0.25);">INCORRECTA </span>`
 }
 </td>
 </tr>
 `).join('') : `
 <tr>
 <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay registros históricos de predicciones.</td>
 </tr>
 `}
 </tbody>
</table>`;

 html = html.replace('{{DYNAMIC_STATS_AND_BETS}}', dynamicStatsAndBets);
 html = html.replace('{{DYNAMIC_PREDICTIONS_TABLE}}', dynamicPredictionsTable);

 return sendHTML(res, html);
 }

 // Servir archivos estáticos locales de CSS y JS de forma segura
 if ((pathname.startsWith('/css/') || pathname.startsWith('/js/')) && method === 'GET') {
 const safePath = path.join(__dirname, pathname);
 if (safePath.startsWith(__dirname)) {
 try {
 const content = fs.readFileSync(safePath);
 const ext = path.extname(pathname);
 const mime = ext === '.css' ? 'text/css' : 'application/javascript';
 res.writeHead(200, { 'Content-Type': mime });
 return res.end(content);
 } catch {}
 }
 return send(res, { error: 'Not found' }, 404);
 }

 send(res, { error: 'Not found', endpoints: ['GET /health', 'GET /last', 'GET /predict', 'GET /dashboard', 'POST /data', 'POST /analyze', 'POST /predict-final'] }, 404);
 } catch (e) {
 send(res, { error: e.message }, 500);
 }
});

const BIND_HOST = process.env.HOST || '0.0.0.0';
const SSL_PORT = 3443;
const sslOptions = {
 key: fs.readFileSync('/tmp/apuestas-key.pem'),
 cert: fs.readFileSync('/tmp/apuestas-cert.pem')
};
try {
 https.createServer(sslOptions, (req, res) => {
 // Redirect to HTTP or handle directly
 const { pathname, params } = parseURL(req.url);
 if (pathname === '/dashboard') {
 res.writeHead(301, { 'Location': `http://${req.headers.host || 'localhost'}:${PORT}/dashboard` });
 return res.end();
 }
 server.emit('request', req, res);
 }).listen(SSL_PORT, BIND_HOST, () => {
 console.log(` HTTPS: https://0.0.0.0:${SSL_PORT}`);
 });
} catch (e) { console.log(' HTTPS: disabled (no cert)'); }

server.listen(PORT, BIND_HOST, () => {
 const ips = [];
 const os = require('os');
 const ifaces = os.networkInterfaces();
 Object.keys(ifaces).forEach(ifname => {
 ifaces[ifname].forEach(iface => {
 if (!iface.internal && iface.family === 'IPv4') ips.push(iface.address);
 });
 });
 console.log(` APUESTA.IA API running`);
 console.log(` Local: http://127.0.0.1:${PORT}`);
 ips.forEach(ip => console.log(` Red: http://${ip}:${PORT}`));
 console.log(` Dashboard: http://127.0.0.1:${PORT}/dashboard`);
 console.log(` GET /predict?home=X&away=Y`);
 console.log(` POST /data | /analyze | /predict-final`);
});