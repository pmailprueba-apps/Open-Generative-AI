# PROMPT PARA NOTEBOOKLM: Modelos Matemáticos Avanzados para Predicción Deportiva y Apuestas

## Contexto del proyecto
Sistema multi-agente de predicción deportiva (Poisson Avanzado + ELO) que actualmente:
- Usa Poisson con ajuste de **Dixon-Coles** (parámetro ρ) para mayor exactitud en empates bajos.
- Usa ELO básico (K=32, sin ajuste por margen de victoria).
- Realiza análisis **Risk-Neutral**: separa el modelo matemático de las cuotas para detectar **Expected Value (EV+)**.
- Utiliza **Criterio de Kelly Fraccional (1/4)** para recomendar un stake exacto.
- Rechaza automáticamente apuestas que resulten en un EV Negativo, priorizando la protección del bankroll.
- Tiene contexto regional inyectado sobre ventaja de altitud en Liga MX y la eliminación del Play-In.

## Objetivo
El sistema ya cuenta con una base matemática robusta (Dixon-Coles, Kelly, EV+). El objetivo ahora es recopilar literatura científica para evolucionar hacia modelos de Machine Learning (XGBoost, Redes Neuronales), mejorar el sistema ELO (incluyendo margen de victoria), y modelar el comportamiento dinámico (in-play).
---

## Áreas de investigación solicitadas (priorizadas)

### 1. Modelos de Gol Esperado Dinámicos (Evolución Temporal)
- **Baio & Blangiardo (2010)**: Modelo Bayesiano jerárquico para fútbol (modelo BB8).
  - Buscar: especificación completa del modelo, prior distributions, implementación en Stan/PyMC
- **Rue & Salvesen (2000)**: Modelo dinámico Bayesiano con random walk.
  - Buscar: cómo modelan la evolución temporal de la fuerza de los equipos
- **Modelos de Supervivencia y Riesgo Competitivo (Hazard Models)**:
  - Para calcular el tiempo del primer gol y probabilidades in-play.

### 2. Sistemas de Rating (ELO y superiores)
- **ELO con margen de victoria**: Fórmulas de ajuste para deportes donde importa la diferencia de goles (ej. ELO para fútbol de FiveThirtyEight)
- **Glicko-2 (2001)**: Sistema que incluye RD (Rating Deviation) para medir incertidumbre.
  - Buscar: fórmula completa de actualización, cómo calcular el RD inicial, período de rating
- **Plackett-Luce**: Modelo de ranking basado en comparaciones pareadas
- **TrueSkill (Microsoft Research)**: Extensión de Glicko para equipos multijugador
- **ELO por posición/contexto**: ELO de ataque y defensa separados

### 3. Modelado de Factores Ambientales y Multimodales (Ej. Liga MX)
- **Ventaja de Altitud Cuantificada**: Papers científicos sobre la merma aeróbica en el segundo tiempo en fútbol profesional (altitud > 2000m como Toluca o Pumas).
- **Fatiga y Rotación de Plantilla**: Modelos que incorporan descanso (días entre partidos) y su impacto matemático en la probabilidad de ganar de visita.
- **Eficiencia del Mercado en Ligas Latinoamericanas**: Estudios sobre si las casas de apuestas subestiman sistemáticamente la localía en condiciones geográficas extremas.

### 4. Machine Learning Aplicado
- **Random Forest / XGBoost / LightGBM** para predicción 1X2:
  - Features más predictivas: posesión, tiros a puerta, xG, forma, lesiones
  - Handling de datos desbalanceados (empates vs victorias locales)
  - Benchmarks publicados: ¿cuánto mejora un modelo ML sobre Poisson puro?
- **Redes Neuronales**:
  - Arquitecturas usadas en fútbol (CNNs para secuencias de partidos, LSTMs para forma temporal)
  - Deep learning para expectativa de goles (modelos inspirados en xG)
- **Bayesian ML**:
  - Gaussian Process regression para fuerza de equipo
  - Dirichlet-multinomial para resultados 1X2

### 5. Modelos Avanzados de Apuestas
- **Monte Carlo para apuestas**: Simulación de temporadas completas para calcular varianza
- **Modelos de in-play (tiempo real)**:
  - Procesos de Poisson no homogéneos (la tasa de gol cambia durante el partido)
  - Modelos de supervivencia para tiempo del primer gol
- **Arbitraje y surebets**:
  - Detección matemática de oportunidades de arbitraje
  - Fórmulas para calcular stake óptimo en arbitraje
- **Modelos de cuotas móviles (wisdom of the crowd)**:
  - Cómo las cuotas del mercado en vivo reflejan información agregada
  - Modelos de predicción basados solo en movemento de cuotas

### 6. Evaluación de Modelos
- **Métricas específicas para apuestas**:
  - ROI (Return on Investment), yield, profit factor
  - Brier score adaptado para probabilidades 1X2
  - Rank Probability Score (RPS) para resultados ordenados
  - Log-loss vs accuracy: por qué accuracy no sirve en apuestas
- **Backtesting**:
  - Cómo hacer backtesting sin data snooping bias
  - Walk-forward validation para modelos temporales
  - Tamaño mínimo de muestra para evaluar un modelo de apuestas

### 7. Datasets y APIs
- **Fuentes de datos gratuitas/públicas**:
  - football-data.org, api-football, OpenLigaDB, StatsBomb (gratis parcial)
  - Kaggle datasets: "European football data", "Sports betting datasets"
  - Scraping: sitios que permiten scraping vs bloquean (Cloudflare)
- **Datos avanzados (xG, posesión, etc.)**:
  - Understat, FBref, WhoScored — APIs no oficiales
  - StatsBomb 360 data (gratis para investigación)

---

## Formato de respuesta esperado

Para cada área, proporcionar:

1. **Nombre del modelo/paper** con autor y año
2. **Fórmula matemática** (en LaTeX si posible o notación clara)
3. **Implementación de referencia** (librería, repo de GitHub, o pseudocódigo)
4. **Benchmarks conocidos**: ¿qué precisión/ROI reportan?
5. **Limitaciones conocidas**: ¿cuándo falla este modelo?
6. **Relevancia para apuestas en México/Latinoamérica**: ¿funciona con ligas de la región?

---

## Requisitos adicionales

- Priorizar modelos con implementaciones open source disponibles
- Incluir papers de 2015-2026 (investigación reciente)
- Buscar específicamente casos de uso en LATAM (Liga MX, Brasileirão, Libertadores)
- Si hay modelos contradictorios (ej. ML vs Poisson), incluir ambas perspectivas con evidencia
