# APUESTA.IA — Contexto Completo para Agentes de IA

## 1. IDENTIDAD DEL PROYECTO

- **Nombre**: APUESTA.IA (24-apuestas)
- **Ruta**: `/Users/macbook/Proyectos/24-apuestas`
- **Propósito**: Plataforma multi-agente de predicción deportiva. Coordina 3 agentes IA para raspar datos deportivos, ejecutar modelos Poisson + ELO, calcular Valor Esperado (EV+) contra momios reales de casas de apuesta (Caliente.mx, Codere.mx).
- **Entorno**: macOS, Node.js v25.9.0, Next.js (Mission Control en puerto 3000)
- **Arquitectura**: 100% local. Sin cloud. Sin bases de datos externas.

## 2. ARQUITECTURA DE 3 AGENTES

```
SCOUT (ID: 187)         ANALYST (ID: 188)          PREDICTOR (ID: 189)
  opencode (label)        claude-code (label)        gemini (label)
  ┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
  │ scraper-     │       │ predictor-       │       │ server-predict   │
  │ historico.sh │       │ engine.js        │       │ .js              │
  │ consultar.sh │────▶  │ (Poisson + ELO)  │────▶  │ (EV + stake rec) │
  │ pipeline-    │       │                  │       │                  │
  │ predict.sh   │       │                  │       │ /predict-final   │
  └──────────────┘       └──────────────────┘       └──────────────────┘
       curl/agent-browser      Node.js math            REST API :3456
```

### AGENTE SCOUT (etiqueta: opencode)
- **NO usa la API de Opencode.ai**. Los scripts usan `curl` y `agent-browser` (Playwright).
- Raspa 14+ fuentes: Caliente.mx, Codere.mx, FlashScore, SofaScore, 365Scores, FBref, WorldFootball, LigaMX.net, Transfermarkt, RSSSF, ESPN Mexico, Goal.com.
- Ejecutable manualmente desde el dashboard (botón INICIAR/DETENER SCOUT).
- NO consume créditos de IA. Solo ancho de banda HTTP.

## 3. ESTRUCTURA DE ARCHIVOS

```
/Users/macbook/Proyectos/24-apuestas/
├── index.html              # Dashboard HTML (494 líneas)
├── css/style.css           # Estilos dark mode premium (1477 líneas)
├── js/main.js              # Lógica frontend (932 líneas)
├── server-predict.js       # API REST :3456 (395 líneas)
│   ├── GET  /health        # Health check
│   ├── GET  /last          # Última predicción
│   ├── GET  /predict       # Predicción rápida vía query string
│   ├── GET  /dashboard     # Dashboard completo con datos inyectados
│   ├── GET  /scout/status  # Estado del SCOUT (running/logs)
│   ├── POST /data          # Scout sube datos
│   ├── POST /analyze       # Analyst procesa
│   ├── POST /predict-final # Predictor guarda predicción
│   ├── POST /run-scout     # Ejecuta scraper-historico.sh
│   └── POST /scout/stop    # Detiene scraper
├── predictor-engine.js     # Motor Poisson + ELO (290 líneas)
├── apuestas-db.js          # Base de datos local JSON (207 líneas)
├── apuestas-data.json      # Datos históricos (180 líneas)
├── datos_partido.json      # Datos temporales del partido
├── ultima_prediccion.json  # Última predicción generada
├── scraper-historico.sh    # Script multi-fuente (72 líneas)
├── consultar.sh            # Consulta CLI de predicción (75 líneas)
├── pipeline-predict.sh     # Pipeline completo (160 líneas)
├── scrape-caliente.sh      # Scraper ligero Caliente (36 líneas)
├── start-all.sh            # Inicia todos los servicios (28 líneas)
├── start-pm2.sh            # Inicia con PM2 (46 líneas)
├── ecosystem.config.js     # Config PM2 (45 líneas)
├── Dockerfile              # Docker build
├── Dockerfile.scraper      # Docker scraper standalone
├── docker-compose.qnap.yml # Docker compose
├── check-resultados.sh     # Verificador de resultados (56 líneas)
├── como-conectar.sh        # Guía de conexión (55 líneas)
├── crear-recordatorio.sh   # Recordatorio de partidos (54 líneas)
├── partidos.ics            # Calendario de partidos
├── README.md               # Documentación completa (407 líneas)
├── AGENT_CONTEXT.md        # Contexto original (55 líneas)
├── ANALISIS_PREDICCIONES.md# Roadmap (54 líneas)
└── AGENT_CONTEXT_COMPLETO.md # Este archivo
```

## 4. API REST — PUERTO 3456

### Endpoints

| Método | Ruta | Descripción | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/health` | Health check | — | `{ status, service, agents, timestamp }` |
| GET | `/last` | Última predicción | — | Objeto predicción completo |
| GET | `/predict?home=X&away=Y` | Predicción rápida | Query params | Objeto predicción |
| GET | `/dashboard` | Dashboard HTML | — | HTML con datos inyectados |
| GET | `/scout/status` | Estado del SCOUT | — | `{ running: bool, logs: [] }` |
| POST | `/data` | Subir datos | JSON body | `{ status, agent, fields }` |
| POST | `/analyze` | Analizar partido | `{ home, away }` | `{ agent, match, probabilities }` |
| POST | `/predict-final` | Predicción final | `{ home, away, ... }` | Objeto predicción + guarda en DB |
| POST | `/run-scout` | Iniciar scraper | — | `{ status: "started" }` |
| POST | `/scout/stop` | Detener scraper | — | `{ status: "stopped" }` |

### Servir archivos estáticos
- `/css/style.css` → `text/css`
- `/js/main.js` → `application/javascript`

## 5. MODELO DE PREDICCIÓN (predictor-engine.js)

### Distribución Poisson
- Calcula goles esperados (λ) para local y visitante.
- λ = ataque × forma × localía × H2H - penalización lesiones
- Matriz de probabilidad hasta 6 goles por equipo.
- Blend: 70% modelo Poisson + 30% odds de mercado (si disponibles).

### Sistema ELO
- Rating base: 1500 para cada equipo.
- Actualización: K=32 tras cada partido.
- `expectedScore(ratingA, ratingB)` → probabilidad de victoria.

### Output
```json
{
  "match": { "home": "PSG", "away": "Arsenal", "league": "..." },
  "prediction": {
    "winner": "PSG",
    "home_prob": 48, "draw_prob": 28, "away_prob": 24,
    "confidence": 72, "confidence_label": "ALTA",
    "recommended_stake": "Moderado (3-5%)",
    "bet_type": "Local (1)",
    "reasoning": ["..."]
  },
  "model": { "lambda_home": 1.42, "lambda_away": 1.08, ... }
}
```

## 6. DASHBOARD — FRONTEND

### Cómo acceder
- `http://127.0.0.1:3456/dashboard`
- `http://<IP-local>:3456/dashboard`

### Secciones del dashboard
1. **Simulador de Inferencia** — Selector de partido, marcador en vivo, probabilidades, calculadora What-If (fatiga, clima, sentimiento, táctica).
2. **Panel XAI** — Comentario explicativo generado por IA según variables ajustadas.
3. **INEGI MOPRADEF** — Datos de actividad física en México con gráficos interactivos y tabla de líderes Liga MX.
4. **Calculadora de Cobertura** — Simulador de hedging con 4 escenarios (ambos ganan, solo 1er, solo 2do, pierden ambos) + arbitraje en vivo.
5. **Guardia de Juego Responsable** — Monitor de estrés, simulador de apuestas, bloqueo por impulsividad.
6. **Historial de Predicciones** — Tabla dinámica con resultados correctos/incorrectos/pendientes.
7. **Botón SCOUT** — Iniciar/detener scraper manualmente desde el header.

### Interacciones del usuario
- Sliders de fatiga/clima/sentimiento → recalculan probabilidades en vivo.
- Toggle táctico → simula alineación ofensiva.
- Selector de partido → cambia entre PSG-Arsenal, Toluca-Tigres, Pumas-Cruz Azul.
- Toggle Guardian → activa/desactiva monitor de estrés.
- Botón "Simular Apuesta" → incrementa estrés, puede bloquear.
- Calculadora de cobertura → inputs de equipo/momio/monto recalcan 4 escenarios.
- Preset PSG+Toluca → carga valores de ejemplo.

## 7. SISTEMA DE ARCHIVOS — DATOS PERSISTENTES

### `apuestas-data.json`
Base de datos local. Estructura:
```json
{
  "matches": [
    {
      "home": "PSG", "away": "Arsenal",
      "league": "UEFA Champions League",
      "date": "2026-05-25T...",
      "home_score": 2, "away_score": 1,
      "bet_status": "confirmed",
      "bet_amount": 100,
      "bet_odds": 2.28,
      "bet_selection": "PSG",
      "bet_recibo": "ABC123",
      "source": "predictor"
    }
  ],
  "predictions": [
    {
      "home": "PSG", "away": "Arsenal",
      "winner": "PSG", "confidence": 72,
      "was_correct": true,
      "created_at": "2026-05-25T..."
    }
  ]
}
```

### `ultima_prediccion.json`
Archivo temporal con la predicción más reciente. Sobrescrito en cada `/predict-final`.

### `datos_partido.json`
Datos temporales subidos por el Scout (momios, estadísticas, lesiones).

## 8. COMANDOS ÚTILES

```bash
# Iniciar servidor de predicción
node server-predict.js

# Iniciar con nohup (segundo plano)
nohup node server-predict.js > /tmp/server-predict.log 2>&1 &

# Consultar predicción desde CLI
bash consultar.sh "PSG" "Arsenal" "UEFA Champions League"

# Ejecutar scraper manual
bash scraper-historico.sh

# Ver estadísticas de precisión
node apuestas-db.js stats

# Ver logs del servidor
tail -f /tmp/server-predict.log

# Matar servidor
kill $(lsof -ti :3456)

# Ver IPs de red
ifconfig | grep inet
```

## 9. MODELOS DE IA (etiquetas arquitectónicas)

| Agente | Etiqueta | Implementación Real |
|--------|----------|-------------------|
| SCOUT | opencode | Scripts bash con curl/agent-browser |
| ANALYST | claude-code | predictor-engine.js (Poisson + ELO en Node.js puro) |
| PREDICTOR | gemini | server-predict.js (lógica de decisión y EV) |

**NOTA IMPORTANTE**: Las etiquetas `opencode`, `claude-code`, `gemini` son **conceptuales**. El sistema NO llama a ninguna API de pago. Todo el procesamiento es local con Node.js.

## 10. REGISTRO DE CAMBIOS RECIENTES

### 2026-06-01 — Botón SCOUT en dashboard
- Se agregaron endpoints `/run-scout`, `/scout/stop`, `/scout/status` en `server-predict.js`
- Se mejoró el botón en `index.html` con toggle INICIAR/DETENER
- Se agregó polling de estado en `main.js` cada 3 segundos
- Notificaciones toast al iniciar/detener/finalizar el scraper
- Se eliminó advertencia falsa de "consumo de tokens de Opencode"

## 11. DEPENDENCIAS

### Sistema
- Node.js (v16+)
- bash
- curl
- jq (opcional, para pipeline-predict.sh)
- agent-browser (opcional, para navegación JS pesada)

### Node.js (built-in, sin npm)
- http, https (servidor HTTP)
- fs, path (archivos)
- child_process (ejecución de scripts)
- crypto (random)

### Frontend (sin dependencias)
- HTML5 + CSS3 + Vanilla JS
- Google Fonts: Outfit, Plus Jakarta Sans
- Sin frameworks, sin build step

## 12. SOLUCIÓN DE PROBLEMAS

| Problema | Causa | Solución |
|----------|-------|----------|
| 404 en dashboard | Server no corriendo | `node server-predict.js` |
| Scout no arranca | Script no ejecutable | `chmod +x scraper-historico.sh` |
| curl: no data | Sin internet | Verificar conectividad |
| Puerto ocupado | Otro proceso en :3456 | `lsof -ti :3456 \| xargs kill` |
| Safari no carga | Server caído | Iniciar server primero |
| "command not found: node" | Node.js no instalado | `brew install node` |
