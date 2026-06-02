# SYSTEM CONTEXT FOR AI AGENTS: APUESTA.IA

<system_overview>
Project Name: APUESTA.IA (24-apuestas)
Path: /Users/macbook/Proyectos/24-apuestas
Purpose: Multi-agent sports betting prediction system.
Uses real data from api-football + Caliente.mx odds.
Mathematical engine: Dixon-Coles + ELO + Kelly Criterion + EV+.
Environment: Local macOS, Node.js v25.9.0.
</system_overview>

<critical_rules>
1. NEVER start servers or background processes without explicit user request.
2. NEVER make API calls unless the user explicitly asks for a prediction.
3. The system is MANUAL-ONLY: user runs commands when they want to bet.
4. No cron jobs, no autostart, no background polling.
5. API keys have rate limits: api-football (100/day), football-data (10/min).
6. Cache API responses to avoid wasting requests.
7. If a team is not found in the API → report "INSUFFICIENT DATA", do NOT use generic defaults.
8. The model must NEVER recommend a bet without real team ELO data.
9. ALL recommendations must include EV+ and Kelly stake.
10. If EV is negative or data is insufficient → recommend "NO APOSTAR".
</critical_rules>

<architecture>
Three agents work together ONLY when the user runs a command:

1. SCOUT (data collector):
   - scrapes Caliente.mx odds via puppeteer-extra stealth
   - researches teams via api-football (https://v3.football.api-sports.io)
   - caches responses in .api-cache.json
   - uses spanish-to-english name mapping for teams

2. ANALYST (statistical engine):
   - Dixon-Coles Poisson with ρ=-0.05 for low-score matches
   - ELO rating system (K=32) calculated from recent matches
   - form analysis (last 5 matches with recency weighting)
   - head-to-head history parsing
   - goals scored/conceded averages

3. PREDICTOR (decision maker):
   - Risk-Neutral analysis: model is INDEPENDENT of market odds
   - Expected Value (EV): EV = (p × odds) - 1
   - Kelly Fractional (1/4): optimal stake based on bankroll
   - Rejects all bets with EV < 5%
   - Rejects all bets without real team data
</architecture>

<how_to_use>
All commands are manual. Run them when you want to analyze:

```bash
# Full pipeline: research + predict + EV
./pipeline-predict.sh "Toluca" "Tigres" "2.10,3.30,3.50"

# Quick prediction (without odds, no EV)
./pipeline-predict.sh "Toluca" "Tigres"

# Scrape Caliente for current odds
node scout-caliente.js

# Search for a specific match in Caliente odds
node scout-caliente.js "Toluca" "Tigres"

# Get team statistics from API
node scout-estadisticas.js "Toluca" "Tigres"

# Automated analysis of ALL Caliente matches
node scout-auto.js

# Start dashboard (only when you want to see results)
node server-predict.js
# Then open: http://127.0.0.1:3456/dashboard
```
</how_to_use>

<data_sources>
- api-football (v3.football.api-sports.io):
  Key: a9ede5d41e5f849e6eb9f5a0207dc90d
  Free tier: 100 requests/day
  Covers: ALL leagues worldwide including Liga MX
  
- football-data.org:
  Key: 17b353ccbbc74724bc4be64efa2b552b  
  Free tier: 10 requests/min, 13 European competitions only
  Covers: Champions League, Premier League, La Liga, etc.

- Caliente.mx odds:
  Scraped via puppeteer-extra with stealth plugin
  Bypasses Cloudflare
  Gets 60+ live/upcoming matches with real odds

- DuckDuckGo (fallback):
  Used when API rate limit is hit
  Searches via curl on html.duckduckgo.com (no CAPTCHA)
</data_sources>

<mathematical_model>
- Poisson distribution with Dixon-Coles adjustment (ρ = -0.05)
- ELO rating system (K=32, based on real match results)
- Kelly Criterion fractional (1/4) for stake recommendation
- Expected Value (EV+) for value detection
- Risk-Neutral: model probability is independent of market odds
- No "blend" with market odds — market is only used for EV calculation
- Confidence penalty when no real team data is available (max 35%)
</mathematical_model>

<team_name_mapping>
Team names from Caliente are in SPANISH.
api-football uses ENGLISH names.
Mapping dictionary in scout-estadisticas.js handles 50+ common teams.
Examples: "Suiza" → "Switzerland", "Alemania" → "Germany", "México" → "Mexico"
National teams are prioritized over club teams when searching.
</team_name_mapping>

<rate_limits>
api-football free: 100 requests/day, ~10/minute
If 429 error → exponential backoff: 1s, 2s, 4s (max 3 retries)
API responses cached in .api-cache.json (max 200 entries)
Cache reduces duplicate requests significantly
</rate_limits>

<changelog>
2026-06-01: Initial system with Poisson + ELO
2026-06-02: Added puppeteer-extra stealth for Caliente scraping
            Added Dixon-Coles adjustment (ρ=-0.05)
            Added EV+ and Kelly Criterion
            Added api-football integration (Liga MX support)
            Added team name mapping (spanish→english)
            Added rate limiting with backoff + cache
            System is now MANUAL-ONLY: no background processes
            Killed background server to save tokens/API calls
</changelog>
