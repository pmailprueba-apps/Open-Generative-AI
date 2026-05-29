#   APUESTA.IA — Sistema de Predicción Deportiva Multi-Agente

Plataforma de orquestación multi-agente para predicción deportiva. Coordina 3 agentes IA que recolectan datos de 14+ fuentes web, analizan estadísticas con modelos Poisson/ELO, y generan predicciones con cálculo de valor esperado (EV).

---

## 📋 Índice
1. [Arquitectura del Sistema](#arquitectura)
2. [Los 3 Agentes](#agentes)
3. [Fuentes de Datos (14)](#fuentes)
4. [Pipeline de Predicción](#pipeline)
5. [Modelo Estadístico](#modelo)
6. [Dashboard (Mission Control)](#dashboard)
7. [Comandos Rápidos](#comandos)
8. [Ejemplo: Toluca vs Tigres](#ejemplo)
9. [Base de Datos de Predicciones](#basedatos)

---

<a name="arquitectura"></a>
## 🏗️ Arquitectura del Sistema

```
                    ┌─────────────────────────────────┐
                    │   Mission Control (APUESTA.IA)   │
                    │   http://127.0.0.1:3000          │
                    │   user: admin / pass: Alduke2026!!│
                    └────────────┬────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │  SCOUT       │    │  ANALYST     │    │  PREDICTOR   │
    │  (opencode)  │    │(claude-code) │    │  (gemini)    │
    ├──────────────┤    ├──────────────┤    ├──────────────┤
    │Extrae datos  │    │Modelo Poisson│    │Consolida     │
    │de 14 fuentes │───▶│+ ELO + forma │───▶│+ EV + confia │
    │web          │    │+ lesiones    │    │+ stake rec   │
    └──────────────┘    └──────────────┘    └──────────────┘
           │                                         │
           ▼                                         ▼
    ┌──────────────┐                         ┌──────────────┐
    │ API Server   │                         │ Base de Datos│
    │:3456         │                         │ JSON local   │
    └──────────────┘                         └──────────────┘
```

---

<a name="agentes"></a>
## 🤖 Los 3 Agentes (registrados en Mission Control)

### 1. SCOUT — opencode (ID: 187)
**Rol:** Extractor de datos
**Tarea:** Navega Caliente.mx, Codere.mx, FlashScore, ESPN, Transfermarkt y 10 fuentes más para recolectar momios 1X2, hándicap, forma reciente, H2H, lesiones, datos de fatiga y clima.
**Output:** JSON estructurado con odds, estadísticas y metadatos.

### 2. ANALYST — claude-code (ID: 188)
**Rol:** Analista estadístico
**Tarea:** Recibe datos crudos del Scout y aplica:
- Modelo Poisson para goles esperados (λ)
- Sistema ELO para rating de equipos
- Factor de localía (+15%)
- Forma reciente ponderada
- Penalización por lesiones
- Blending con odds de mercado (70% modelo / 30% mercado)
**Output:** Probabilidades 1X2, factores clave, confianza.

### 3. PREDICTOR — gemini (ID: 189)
**Rol:** Generador de predicción final
**Tarea:** Consolida el análisis del Analyst, calcula Expected Value (EV) para cada resultado vs los momios reales de Caliente.mx, y genera la recomendación final con stake sugerido.
**Output:** `{winner, home_prob, draw_prob, away_prob, confidence, EV, recommended_stake}`

---

<a name="fuentes"></a>
## 🌐 Fuentes de Datos (14 activas)

| # | Fuente | URL | Tipo | Estado |
|---|--------|-----|------|--------|
| 1 | **Caliente.mx** | sports.caliente.mx | Momios 1X2 |   |
| 2 | **Codere Apuestas** | apuestas.codere.mx | Momios y líneas |   |
| 3 | **Codere Blog** | blog.codere.mx | Análisis táctico |   |
| 4 | **Goal México** | goal.com/es-mx | Noticias y lesiones |   |
| 5 | **FlashScore MX** | flashscore.com.mx | Resultados en vivo |   |
| 6 | **SofaScore** | sofascore.com | Estadísticas partido |   |
| 7 | **365Scores** | 365scores.com/es-mx | Scores y calendario |   |
| 8 | **FBref** | fbref.com/es | Estadísticas avanzadas |   |
| 9 | **WorldFootball** | worldfootball.net | Datos globales |   |
| 10 | **LigaMX.net** | ligamx.net | Datos oficiales |   |
| 11 | **Transfermarkt** | transfermarkt.mx | Datos jugadores |   |
| 12 | **RSSSF** | rsssf.org | Resultados históricos |   |
| 13 | **ESPN México** | espn.com.mx/futbol | Estadísticas |   |
| 14 | **Goal.com** | goal.com/es-mx | Noticias |   |

---

<a name="pipeline"></a>
## ⚙️ Pipeline de Predicción (flujo completo)

### FASE 1: SCOUT — Recolección de datos
```
┌─────────────────────────────────────────────────────────────┐
│  bash scraper-historico.sh  (cada 6h vía cron)             │
│                                                             │
│  caliente.mx ────┐                                          │
│  codere.mx  ─────┤                                          │
│  flashscore ─────┼──▶ JSON con odds, stats, noticias        │
│  espn ───────────┤                                          │
│  +10 fuentes ────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

### FASE 2: ANALYST — Modelo Estadístico
```
┌─────────────────────────────────────────────────────────────┐
│  node predictor-engine.js --home "X" --away "Y"             │
│                                                             │
│  λ_local  = ataque_local × forma_local × localía × H2H     │
│  λ_visita = ataque_visita × forma_visita × H2H             │
│                                                             │
│  P(score = k) = (e^(-λ) × λ^k) / k!     (Poisson)          │
│                                                             │
│  home_win% = Σ P(h > a)  para h,a en [0..6]                │
│  draw%    = Σ P(h = a)                                      │
│  away_win% = 100% - home% - draw%                           │
└─────────────────────────────────────────────────────────────┘
```

### FASE 3: PREDICTOR — Decisión final
```
┌─────────────────────────────────────────────────────────────┐
│  curl http://127.0.0.1:3456/predict?home=X&away=Y          │
│                                                             │
│  home_ev = home_prob × home_odds - 1    (Expected Value)    │
│  draw_ev = draw_prob × draw_odds - 1                        │
│  away_ev = away_prob × away_odds - 1                        │
│                                                             │
│  confidence = 30 + (max_prob - 33) × 1.2                   │
│  stake = conservative / moderate / aggressive               │
│                                                             │
│  → Se guarda en: ultima_prediccion.json                     │
│  → Se registra en: apuestas-data.json (historial)           │
└─────────────────────────────────────────────────────────────┘
```

---

<a name="modelo"></a>
##   Modelo Estadístico (Poisson + ELO)

### Distribución Poisson
Calcula la probabilidad de que un equipo anote `k` goles:

```
P(X = k) = (e^(-λ) × λ^k) / k!

Donde λ = goles esperados basado en:
  - Ataque = expected_score(ELO_home, ELO_away) × 1.2
  - Forma reciente (últimos 5 partidos, ponderado)
  - Localía: +15% al equipo local
  - H2H histórico: ajuste según enfrentamientos previos
  - Lesiones: penalización según impacto del jugador
```

### Sistema ELO
```
Expected = 1 / (1 + 10^((ELO_B - ELO_A) / 400))

Actualización post-partido:
  ELO_nuevo = ELO_viejo + K × (resultado - expected)
  K = 32 (factor de ajuste)
```

### Blending con Mercado
```
Probabilidad_final = modelo × 0.7 + odds_implied × 0.3

Donde odds_implied = 1 / momio_decimal
```

---

<a name="dashboard"></a>
##   Dashboard (Mission Control → APUESTA.IA)

**URL:** http://127.0.0.1:3000
**Usuario:** admin
**Contraseña:** Alduke2026!!

### Secciones principales:

| Sección | Función |
|---------|---------|
| **Agent Squad** | Ver los 3 agentes (Scout, Analyst, Predictor) |
| **Orchestration** | Enviar comandos directos a cada agente |
| **Cron Jobs** | Programar scraping automático cada 6h |
| **Activity** | Historial de ejecuciones y eventos |
| **Cost Tracker** | Monitoreo de uso de tokens |
| **Log Viewer** | Logs en tiempo real del sistema |

---

<a name="comandos"></a>
## ⌨️ Comandos Rápidos

### Iniciar todos los servicios
```bash
bash /Users/macbook/Proyectos/24-apuestas/start-all.sh
```

### Consultar predicción de cualquier partido
```bash
cd /Users/macbook/Proyectos/24-apuestas
bash consultar.sh "Toluca" "Tigres" "CONCACAF Final"
bash consultar.sh "PSG" "Arsenal" "Champions Final"
```

### Ejecutar scraper manualmente
```bash
cd /Users/macbook/Proyectos/24-apuestas
bash scraper-historico.sh
```

### Ver estadísticas del sistema
```bash
cd /Users/macbook/Proyectos/24-apuestas
node apuestas-db.js stats
node apuestas-db.js list
```

### API de predicción (endpoints)
```bash
# Predicción GET
curl "http://127.0.0.1:3456/predict?home=Toluca&away=Tigres"

# Subir datos manualmente (Scout)
curl -X POST http://127.0.0.1:3456/data \
  -H "Content-Type: application/json" \
  -d '{"h2h":[[2,1],[1,1]],"home-form":["W","W","D"]}'

# Ver última predicción
curl http://127.0.0.1:3456/last
```

### Ver predicción guardada
```bash
cat /Users/macbook/Proyectos/24-apuestas/ultima_prediccion.json | python3 -m json.tool
```

---

<a name="ejemplo"></a>
## 📌 Ejemplo Práctico: Toluca vs Tigres (CONCACAF Champions Cup Final)

**Datos recolectados por los agentes:**

### Scout (de Caliente.mx + Codere.mx)
| Equipo | Momio | Torneo | G.F | G.C | Goleador |
|--------|-------|--------|-----|-----|----------|
| **Toluca** | 1.909 | 4G 0E 2P | 18 | 7 | Paulinho (8) |
| **Empate** | 3.60 | — | — | — | — |
| **Tigres** | 3.85 | 5G 1E 2P | 14 | 8 | Aguirre (4) |

### Analyst (modelo Poisson)
| Variable | Valor |
|----------|-------|
| λ Toluca | 0.91 goles esperados |
| λ Tigres | 0.52 goles esperados |
| ELO Toluca | 1530 |
| ELO Tigres | 1510 |
| Ventaja localía | +15% |

### Predictor (resultado final)
| Resultado | Probabilidad | EV |
|-----------|-------------|-----|
| **Toluca**   | **45%** | -14.1% |
| Empate | 33% | **+18.8%** |
| Tigres | 22% | -15.3% |

**Recomendación:** $200 a Toluca (1.909) → retorno de $382 si gana

---

<a name="basedatos"></a>
## 💾 Base de Datos de Predicciones

Cada predicción que realizas se guarda automáticamente en `apuestas-data.json` con:

```json
{
  "matches": [{ partidos registrados con odds y resultados }],
  "predictions": [{ predicciones con probabilidades, winner, confianza }],
  "sources": { fuentes de datos configuradas }
}
```

### Comandos de la DB
```bash
# Ver estadísticas
node apuestas-db.js stats

# Listar últimos partidos
node apuestas-db.js list

# Registrar resultado real (después del partido)
# (editar apuestas-data.json directamente)

# Agregar nueva fuente
node apuestas-db.js add-source "nombre" "url" "tipo"
```

### Para mejorar la precisión:
1. Después de cada partido, edita `apuestas-data.json` y agrega el resultado real
2. Ejecuta `node apuestas-db.js stats` para ver la precisión acumulada
3. Los datos históricos alimentarán un modelo mejorado en el futuro

---

## 📁 Estructura del Proyecto

```
/Users/macbook/Proyectos/24-apuestas/
├── index.html              ← Dashboard visual (concepto)
├── css/style.css           ← Estilos
├── js/main.js              ← Lógica del dashboard
├── predictor-engine.js     ← Motor Poisson + ELO
├── server-predict.js       ← API REST (puerto 3456)
├── apuestas-db.js          ← Base de datos local
├── consultar.sh            ← Consulta rápida de predicción
├── scraper-historico.sh    ← Scraper multi-fuente
├── start-all.sh            ← Iniciar todos los servicios
├── datos_partido.json      ← Datos del partido actual
├── ultima_prediccion.json   ← Última predicción generada
├── apuestas-data.json      ← Historial de predicciones
├── ANALISIS_PREDICCIONES.md ← Documento de análisis
└── README.md               ← Este archivo
```

---

## 🔗 Enlaces Útiles

| Recurso | URL |
|---------|-----|
| **APUESTA.IA Dashboard** | http://127.0.0.1:3456/dashboard |
| **Mission Control** | http://127.0.0.1:3000 |
| **API de predicción** | http://127.0.0.1:3456 |
| **Caliente.mx** | https://sports.caliente.mx |
| **Codere Blog** | https://blog.codere.mx |
| **Mission Control repo** | /Users/macbook/mission-control |

---

## ❓ Preguntas Frecuentes (FAQ)

### ¿Por qué el sistema no detectó los "Momios Mejorados" de Caliente.mx?
El scraper descargaba la página de Caliente.mx pero **solo contaba los bytes** sin analizar el contenido. La sección "Momios Mejorados" es una fila promocional especial dentro de la página que no estaba siendo parseada. Se actualizó el scraper (`scraper-historico.sh`) para que busque activamente esa sección y la registre en los logs. Además, el modelo ahora acepta `caliente_mejorados` como campo de odds prioritario en `datos_partido.json`.

### ¿Desde dónde corre Mission Control? Si se apaga el equipo, ¿qué deja de funcionar?
**Todo corre en tu MacBook local.** No hay servidores remotos ni VPS:

| Servicio | Puerto | Comando | Si se apaga la Mac |
|----------|--------|---------|-------------------|
| **Mission Control** | `:3000` | `pnpm dev` en `~/mission-control/` |   DEJA DE FUNCIONAR |
| **Prediction API** | `:3456` | `node server-predict.js` en `~/24-apuestas/` |   DEJA DE FUNCIONAR |
| **Scrapers (cron)** | — | `crontab` del sistema |   DEJAN DE FUNCIONAR |
| **Base de datos JSON** | — | Archivos en `~/24-apuestas/` |   DEJAN DE FUNCIONAR |
| **Caliente.mx** | — | Externo (cloud) |   SIGUE FUNCIONANDO |
| **Codere.mx** | — | Externo (cloud) |   SIGUE FUNCIONANDO |

**Solución:** Para que funcione 24/7, migrar a un VPS o servidor en la nube.

### ¿Cómo sé si hay Momios Mejorados disponibles?
Revisa el dashboard en `http://127.0.0.1:3456/dashboard` o ejecuta:
```bash
cd /Users/macbook/Proyectos/24-apuestas && bash scraper-historico.sh | grep -i "mejorados"
```

### ¿Cuánto dinero llevo apostado/ganado con el sistema?
```bash
cd /Users/macbook/Proyectos/24-apuestas && node apuestas-db.js stats
```

### ¿Cómo registro un resultado real después del partido?
Edita `apuestas-data.json` manualmente agregando el marcador (`home_score`, `away_score`) al partido correspondiente. Luego ejecuta `node apuestas-db.js stats` para ver la precisión actualizada.

---

## 🖥️ Especificaciones Técnicas

| Componente | Detalle |
|-----------|---------|
| **Node.js** | v25.9.0 |
| **Next.js** | 16.1.6 (Turbopack) |
| **Base de datos** | SQLite (Mission Control) + JSON (APUESTA.IA) |
| **Modelo predictivo** | Poisson distribución + ELO rating |
| **Browser automation** | agent-browser + Chromium 148 |
| **Idiomas** | Español, English (9 idiomas disponibles) |
| **Puertos** | 3000 (MC), 3456 (API predictiva) |

---

*APUESTA.IA — Predicción Deportiva Multi-Agente*
*Sistema basado en orquestación de agentes opencode, Claude Code y Gemini*
*Mayo 2026*
*14 fuentes de datos · Modelo Poisson + ELO · 3 agentes coordinados*
