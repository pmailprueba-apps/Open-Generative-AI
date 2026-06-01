# SYSTEM CONTEXT FOR AI AGENTS: APUESTA.IA

<system_overview>
Project Name: APUESTA.IA (24-apuestas)
Path: /Users/macbook/Proyectos/24-apuestas
Purpose: Multi-agent orchestration platform for sports betting predictions. Uses Poisson + ELO mathematical models. Real bookmaker odds SOLO si el usuario las ingresa manualmente — Caliente.mx está bloqueado por Cloudflare y no se puede raspar automáticamente.
Environment: Local execution on MacBook (Node.js v25.9.0, Next.js).
</system_overview>

<architecture>
The system relies on 3 main agents, coordinated by Mission Control (localhost:3000):

1. SCOUT (ID: 187 — scraper/curl):
   - Role: Data extractor and scraper.
   - Task: Scrapes available sources via curl/agent-browser.
   - ⚠️ LIMITACIÓN: Caliente.mx bloqueado por Cloudflare. agent-browser tampoco pasa el challenge.
   - Fuentes que SÍ funcionan: FlashScore, Codere blog, ESPN, Goal.com, RSSSF, FBref (vía curl).
   - Odds reales: SOLO si el usuario las ingresa manualmente (parámetros en consultar.sh o dashboard).
   - Output: JSON con datos disponibles. Sin odds → modelo usa solo Poisson puro.

2. ANALYST (ID: 188 - claude-code):
   - Role: Statistical modeling.
   - Task: Processes raw data using Poisson Distribution (for expected goals λ) and ELO Rating systems. Adjusts for home-field advantage (+15%), recent form, injuries, and H2H.
   - Output: Produces pure mathematical probabilities (Win, Draw, Lose) by blending model data (70%) and market odds (30%). Executed via `predictor-engine.js`.

3. PREDICTOR (ID: 189 - gemini):
   - Role: Decision maker.
   - Task: Consolidates Analyst's data, compares probabilities against real bookmaker odds to calculate Expected Value (EV).
   - Output: Final prediction, confidence level, and recommended stake (conservative/moderate/aggressive). Exposed via API on `server-predict.js`.
</architecture>

<key_files_and_directories>
- `README.md`: Complete human-readable documentation.
- `ANALISIS_PREDICCIONES.md`: Future roadmap (Deep Learning, live tracking, NLP sentiment analysis).
- `apuestas-data.json`: Local JSON database containing historical records of matches, predictions, and actual results for precision tracking.
- `ultima_prediccion.json`: Temporary file holding the most recent prediction calculated by the system.
- `server-predict.js`: The prediction REST API running on port 3456.
- `apuestas-db.js`: Local database manager. Use `node apuestas-db.js stats` to check system accuracy.
- `scraper-historico.sh`: Primary shell script to trigger the SCOUT data collection phase.
- `consultar.sh`: Quick CLI tool to request a prediction (e.g., `bash consultar.sh "Toluca" "Tigres"`).
- `start-all.sh`: Starts all necessary local services.
- `index.html` & `css/` & `js/`: Frontend concepts for the APUESTA.IA dashboard.
</key_files_and_directories>

<execution_guidelines>
- ALL services are local. Do not assume cloud databases or remote servers are running. If the local machine stops, background jobs (cron) and Node servers will stop.
- To verify system status, check port 3000 (Mission Control) and 3456 (API).
- When asked to predict or run the system, trigger `bash consultar.sh [Home] [Away] [Tournament]`.
- To register a match outcome, directly edit the array in `apuestas-data.json` and append the real result, then run `node apuestas-db.js stats` to update the accuracy baseline.
</execution_guidelines>

<agent_instructions>
When working on this project:
1. DO NOT overwrite the predictive math logic in `predictor-engine.js` without explicitly testing the Poisson/ELO calculation accuracy first.
2. Ensure you preserve the JSON structures exactly as they are in `apuestas-data.json`.
3. If you must add a new scraping source, update `scraper-historico.sh` and register the source in `apuestas-data.json`.
4. Reply in Spanish to the human user, as requested by their global rules.
</agent_instructions>
