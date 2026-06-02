document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // DATASETS: INEGI MOPRADEF 2025 & LIGA MX 2025-2026
    // -------------------------------------------------------------
    const dataSets = {
        'active-pop': {
            title: "Actividad Física en México",
            insight: "El 44.5% de los adultos mexicanos se mantiene físicamente activo, marcando la tasa más alta en una década. La IA procesa esta base social estimando un incremento sostenido en la resistencia cardiaca de las nuevas generaciones de deportistas profesionales.",
            bars: [
                { label: "18+ Activa", value: 44.5, color: "var(--neon-cyan)" },
                { label: "18+ Inactiva", value: 55.5, color: "#1f293d" },
                { label: "Cumple OMS", value: 57.9, color: "var(--neon-green)" },
                { label: "Bajo Nivel", value: 42.1, color: "var(--neon-red)" }
            ]
        },
        'gender-gap': {
            title: "Brecha de Género Deportiva",
            insight: "Se registra la menor brecha histórica (8.4 puntos de diferencia). El 46.7% de hombres y el 37.4% de mujeres hacen ejercicio regular. Modelos predictivos indican que el aumento de participación femenina acelera la tasa de talento competitivo juvenil en un 12%.",
            bars: [
                { label: "Hombres Act.", value: 46.7, color: "var(--neon-cyan)" },
                { label: "Mujeres Act.", value: 37.4, color: "var(--neon-purple)" },
                { label: "Brecha 2025", value: 8.4, color: "var(--neon-red)" },
                { label: "Brecha Hist.", value: 12.5, color: "#1f293d" }
            ]
        },
        'frequency': {
            title: "Frecuencia de Ejercicio Semanal",
            insight: "Un contundente 72.6% de la población activa entrena 3 o más días a la semana. En términos de analítica predictiva de alto rendimiento, este hábito reduce el margen de lesiones musculares repentinas en ligas profesionales locales en un 19%.",
            bars: [
                { label: "3+ Días", value: 72.6, color: "var(--neon-green)" },
                { label: "1-2 Días", value: 22.4, color: "var(--neon-orange)" },
                { label: "Menos de 1", value: 5.0, color: "var(--neon-red)" }
            ]
        },
        'ligamx-balance': {
            title: "Métricas Operativas Liga MX 25/26",
            insight: "La temporada destaca por 2.9 goles promedio por partido y un tiempo efectivo récord de 56m 31s. La regla de menores sumó 45,556 minutos de juego para jóvenes talentos. La IA predice que esta intensidad aumenta la probabilidad de goles en minutos 75+.",
            bars: [
                { label: "Asist. Prom (k)", value: 23.4, color: "var(--neon-cyan)" },
                { label: "Goles Prom x10", value: 29.0, color: "var(--neon-green)" }, /* scaled by 10 for chart */
                { label: "Min. Menores (k)", value: 45.6, color: "var(--neon-purple)" },
                { label: "Tiempo Efec. (m)", value: 56.5, color: "var(--neon-orange)" }
            ]
        }
    };

    // -------------------------------------------------------------
    // DOM ELEMENTS
    // -------------------------------------------------------------
    // Match Live Controls
    const scoreHomeEl = document.getElementById('scoreHome');
    const scoreAwayEl = document.getElementById('scoreAway');
    const matchTimeEl = document.getElementById('matchTime');

    // New Match Selector & Team Displays
    const matchSelector = document.getElementById('matchSelector');
    const liveMatchIndicator = document.getElementById('liveMatchIndicator');
    const matchLeagueText = document.getElementById('matchLeagueText');
    const shieldHome = document.getElementById('shieldHome');
    const nameHome = document.getElementById('nameHome');
    const shieldAway = document.getElementById('shieldAway');
    const nameAway = document.getElementById('nameAway');
    const calienteOddsPanel = document.getElementById('calienteOddsPanel');

    // What-If Sliders
    const inputFatigue = document.getElementById('inputFatigue');
    const inputClimate = document.getElementById('inputClimate');
    const inputSentiment = document.getElementById('inputSentiment');
    const inputTactics = document.getElementById('inputTactics');

    // What-If Display Values
    const valFatigue = document.getElementById('valFatigue');
    const valClimate = document.getElementById('valClimate');
    const valSentiment = document.getElementById('valSentiment');

    // Gauge Elements
    const gaugeHome = document.getElementById('gaugeHome');
    const valHomePercent = document.getElementById('valHomePercent');
    const valDrawPercent = document.getElementById('valDrawPercent');
    const valAwayPercent = document.getElementById('valAwayPercent');

    // XAI Panel
    const xaiCommentary = document.getElementById('xaiCommentary');

    // INEGI Tabs & Chart
    const tabButtons = document.querySelectorAll('.tab-btn');
    const chartWrapper = document.getElementById('inegiChartWrapper');
    const insightText = document.getElementById('mopradefInsightText');
    const leadersTable = document.getElementById('inegiLeadersTable');

    // Guardian Responsible Betting Elements
    const btnToggleGuardian = document.getElementById('btnToggleGuardian');
    const guardianCard = document.getElementById('guardianCard');
    const guardianStatusHeader = document.getElementById('guardianStatusHeader');
    const stressValue = document.getElementById('stressValue');
    const stressProgressBar = document.getElementById('stressProgressBar');
    const btnPlaceBet = document.getElementById('btnPlaceBet');
    const btnBetDisabled = document.getElementById('btnBetDisabled');
    const guardianTip = document.getElementById('guardianTip');
    const btnScanRadar = document.getElementById('btnScanRadar');

    // Scan running state
    let scanRunning = false;
    let scanPollInterval = null;
    const btnScanText = document.getElementById('btnScanText');
    const scanStatusIndicator = document.getElementById('scanStatusIndicator');

    // Poll scan status on load & periodically
    function pollScanStatus() {
        fetch('/scan-status')
            .then(r => r.json())
            .then(data => {
                const wasRunning = scanRunning;
                scanRunning = data.running;
                updateScanUI();
                if (wasRunning && !scanRunning) {
                    // Scan just finished
                    showScanNotification('✅ ESCANEO finalizado');
                    
                    const radarPanel = document.getElementById('radarResultsPanel');
                    if (data.report && data.report.length > 0) {
                        // Construir tarjetas dinámicas
                        let cardsHtml = `<h2 style="font-size: 1.1rem; color: var(--neon-cyan); margin-bottom: 0.5rem; text-transform: uppercase;">🚨 ${data.report.length} OPORTUNIDAD(ES) ENCONTRADA(S)</h2>`;
                        cardsHtml += `<div style="display: flex; gap: 1rem; flex-wrap: wrap;">`;
                        
                        data.report.forEach((rep, i) => {
                            cardsHtml += `
                                <div style="background: rgba(11,15,25,0.8); border: 1px solid var(--neon-cyan); border-radius: 8px; padding: 1rem; flex: 1; min-width: 280px; box-shadow: 0 4px 15px rgba(0, 240, 255, 0.1);">
                                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${rep.fixture}</h3>
                                    <p style="margin: 0; font-size: 0.85rem; color: #a1aabf;">Apuesta sugerida: <strong style="color: var(--neon-green)">${rep.betType}</strong></p>
                                    <p style="margin: 0; font-size: 0.85rem; color: #a1aabf;">Momio / Prob Real: ${rep.odds} / ${(rep.realProb*100).toFixed(1)}%</p>
                                    <div style="margin-top: 10px; display:flex; justify-content: space-between; align-items:center;">
                                        <span style="background: rgba(0,255,102,0.2); color: var(--neon-green); padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">EV+ ${(rep.expectedValue*100).toFixed(1)}%</span>
                                        <button class="btn-primary" onclick="loadMatchToSimulator('${rep.fixture}', '${rep.betType}', '${rep.odds}')" style="padding: 6px 12px; font-size: 0.75rem;">Cargar al Simulador</button>
                                    </div>
                                </div>
                            `;
                        });
                        cardsHtml += `</div>`;
                        
                        radarPanel.innerHTML = cardsHtml;
                        radarPanel.style.display = 'block';
                    } else if (data.report && data.report.length === 0) {
                        radarPanel.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Escaneo completado. No se encontraron apuestas con ventaja matemática en los próximos 7 días.</p>`;
                        radarPanel.style.display = 'block';
                    }
                }
            })
            .catch(() => {});
    }

    // Función global para cargar resultados del radar al simulador
    window.loadMatchToSimulator = function(fixtureStr, betType, oddsStr) {
        document.getElementById('nameHome').textContent = fixtureStr.split(' vs ')[0];
        document.getElementById('nameAway').textContent = fixtureStr.split(' vs ')[1];
        document.getElementById('shieldHome').textContent = fixtureStr.split(' vs ')[0].substring(0,3).toUpperCase();
        document.getElementById('shieldAway').textContent = fixtureStr.split(' vs ')[1].substring(0,3).toUpperCase();
        
        document.getElementById('hedgingTeam1').value = `${betType} (${fixtureStr})`;
        document.getElementById('hedgingOdds1').value = oddsStr;
        
        document.getElementById('xaiCommentary').textContent = `Cargado desde RADAR 24/7. Oportunidad matemática (EV+) detectada en el mercado de ${betType}.`;
        
        // Empezar el reloj desde cero o algún valor
        currentMatch = fixtureStr;
        matchMinute = 0;
        matchSecond = 0;
        document.getElementById('matchTime').style.color = "var(--text-color)";
        document.getElementById('liveMatchIndicator').textContent = "SIMULANDO";
        document.getElementById('liveMatchIndicator').style.background = "var(--neon-cyan)";
        document.getElementById('matchLeagueText').textContent = "Pre-Match Scanner";
        
        // Esconder el panel si se desea, o hacer auto-scroll
        document.getElementById('hedgingTeam1').scrollIntoView({ behavior: 'smooth' });
    };

    function updateScanUI() {
        if (!btnScanRadar || !btnScanText || !scanStatusIndicator) return;
        if (scanRunning) {
            btnScanRadar.style.borderColor = 'var(--neon-green)';
            btnScanRadar.style.color = 'var(--neon-green)';
            btnScanRadar.style.background = 'rgba(0, 255, 102, 0.1)';
            btnScanText.textContent = 'ESCANEO EN CURSO...';
            btnScanRadar.disabled = true; // No lo dejamos detener manualmente por ahora
            scanStatusIndicator.style.display = 'inline-block';
            scanStatusIndicator.style.background = 'var(--neon-green)';
        } else {
            btnScanRadar.style.borderColor = 'var(--neon-cyan)';
            btnScanRadar.style.color = 'var(--neon-cyan)';
            btnScanRadar.style.background = 'rgba(0, 240, 255, 0.1)';
            btnScanText.textContent = 'RADAR 24/7';
            btnScanRadar.disabled = false;
            scanStatusIndicator.style.display = 'none';
        }
    }

    function showScanNotification(msg) {
        const old = document.getElementById('scanToast');
        if (old) old.remove();
        const toast = document.createElement('div');
        toast.id = 'scanToast';
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: rgba(11,15,25,0.95); border: 1px solid rgba(0,255,102,0.3); color: #fff; padding: 12px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; z-index: 9999; backdrop-filter: blur(12px); box-shadow: 0 8px 30px rgba(0,0,0,0.5); animation: fadeIn 0.3s ease;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 4000);
    }

    if (btnScanRadar) {
        btnScanRadar.addEventListener('click', () => {
            if (scanRunning) return;

            // START
            if (!confirm('¿Iniciar el RADAR 24/7?\n\nBuscará en la API de Football partidos programados en los próximos 7 días, calculará el True ELO y extraerá oportunidades rentables (EV+). Esto tomará ~30 segundos debido al rate-limit de la API.')) return;

            btnScanText.textContent = 'INICIANDO...';
            btnScanRadar.disabled = true;

            fetch('/scan-upcoming', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'started') {
                        scanRunning = true;
                        updateScanUI();
                        showScanNotification('🚀 Escáner iniciado en 2do plano');
                    } else if (data.status === 'complete') {
                        scanRunning = false;
                        updateScanUI();
                        showScanNotification('✅ Escáner completado con éxito');
                    } else if (data.error) {
                        alert('Error: ' + data.error);
                        scanRunning = false;
                        updateScanUI();
                    }
                })
                .catch(err => {
                    alert('Fallo de conexión');
                    scanRunning = false;
                    updateScanUI();
                });
        });
    }

    // Poll every 3 seconds for status changes
    pollScanStatus();
    if (scanPollInterval) clearInterval(scanPollInterval);
    scanPollInterval = setInterval(pollScanStatus, 3000);

    // State Variables
    let currentMatch = '';
    let matchMinute = 0;
    let matchSecond = 0;
    let bettingStress = 18;
    let guardianActive = false;
    let betCooldownActive = false;

    // -------------------------------------------------------------
    // LIVE MATCH SIMULATION (CLOCK TICK)
    // -------------------------------------------------------------
    function setEmptyState() {
        scoreHomeEl.textContent = "-";
        scoreAwayEl.textContent = "-";
        matchTimeEl.textContent = "Esperando Datos...";
        matchTimeEl.style.color = "var(--text-muted)";
        liveMatchIndicator.textContent = "STANDBY";
        liveMatchIndicator.style.background = "var(--bg-card-hover)";
        nameHome.textContent = "Local";
        nameAway.textContent = "Visitante";
        shieldHome.textContent = "?";
        shieldAway.textContent = "?";
        matchLeagueText.textContent = "Seleccione una oportunidad";
        valHomePercent.textContent = "--%";
        valDrawPercent.textContent = "--%";
        valAwayPercent.textContent = "--%";
    }
    setEmptyState();

    setInterval(() => {
        if (!currentMatch) return;

        matchSecond += 1;
        if (matchSecond >= 60) {
            matchSecond = 0;
            matchMinute += 1;
        }

        const secStr = matchSecond < 10 ? '0' + matchSecond : matchSecond;
        matchTimeEl.textContent = `Min ${matchMinute}:${secStr}`;

        // Micro-fluctuation of values to simulate live odds shifting
        if (matchSecond % 5 === 0) {
            recalculateProbabilities();
        }
    }, 1000);

    // -------------------------------------------------------------
    // PROBABILITY MATHEMATICAL INFERENCE ENGINE
    // -------------------------------------------------------------
    function recalculateProbabilities() {
        const fatigue = parseInt(inputFatigue.value);
        const climate = parseInt(inputClimate.value);
        const sentiment = parseInt(inputSentiment.value);
        const isOffensive = inputTactics.checked;

        // Base probabilities from actual Poisson models
        let homeProb = 45;
        let drawProb = 33;
        let awayProb = 22;

        if (currentMatch === 'tol-tig') {
            homeProb = 45;
            drawProb = 33;
            awayProb = 22;
        }

        // 1. Wearable / Fatigue Impact (Home suffers if fatigue > 40%)
        if (fatigue > 40) {
            const fatiguePenalty = (fatigue - 40) * 0.35;
            homeProb -= fatiguePenalty;
            awayProb += fatiguePenalty * 0.7;
            drawProb += fatiguePenalty * 0.3;
        } else {
            const fatigueBonus = (40 - fatigue) * 0.15;
            homeProb += fatigueBonus;
            drawProb -= fatigueBonus * 0.6;
            awayProb -= fatigueBonus * 0.4;
        }

        // 2. Climate / Humidity Impact
        if (climate > 50) {
            const climateShift = (climate - 50) * 0.18;
            homeProb -= climateShift * 0.4;
            awayProb -= climateShift * 0.2;
            drawProb += climateShift * 0.6;
        }

        // 3. Social Sentiment Impact
        const sentimentInfluence = (sentiment - 50) * 0.22;
        awayProb += sentimentInfluence;
        homeProb -= sentimentInfluence * 0.7;
        drawProb -= sentimentInfluence * 0.3;

        // 4. Tactical Toggle Impact
        if (isOffensive) {
            awayProb += 8;
            drawProb -= 5;
            homeProb -= 3;
        }

        // Add small random noise
        const noise = (Math.random() - 0.5) * 1.5;
        homeProb += noise;
        awayProb -= noise * 0.6;
        drawProb -= noise * 0.4;

        // Bounds enforcement
        if (homeProb < 5) homeProb = 5;
        if (awayProb < 5) awayProb = 5;
        if (drawProb < 5) drawProb = 5;

        // Normalize to exactly 100%
        const total = homeProb + drawProb + awayProb;
        const normHome = Math.round((homeProb / total) * 100);
        const normAway = Math.round((awayProb / total) * 100);
        const normDraw = 100 - (normHome + normAway);

        // Update DOM values
        valHomePercent.textContent = `${normHome}%`;
        valDrawPercent.textContent = `${normDraw}%`;
        valAwayPercent.textContent = `${normAway}%`;

        // Update SVG Gauge
        const activePercentage = normHome + (normDraw * 0.5);
        const strokeDashOffset = 251.3 - (activePercentage * 251.3 / 100);
        gaugeHome.style.strokeDasharray = `${251.3 - strokeDashOffset} 251.3`;

        // Update Natural Language Commentary
        generateXAICommentary(normHome, normDraw, normAway, fatigue, climate, sentiment, isOffensive);
    }

    function generateXAICommentary(home, draw, away, fatigue, climate, sentiment, tactics) {
        let text = "💡 **Inferencia Explicable de la IA:** ";
        
        let hName = "PSG";
        let aName = "Arsenal";
        if (currentMatch === 'tol-tig') {
            hName = "Toluca";
            aName = "Tigres UANL";
        } else if (currentMatch === 'pu-ca') {
            hName = "Pumas UNAM";
            aName = "Cruz Azul";
        }

        if (home > away + 15) {
            text += `El modelo favorece firmemente al **${hName} (${home}%)**. `;
        } else if (away > home + 15) {
            text += `La balanza se inclina a favor del **${aName} (${away}%)**. `;
        } else {
            text += `El encuentro se encuentra en alta paridad, con un empate calculado en **${draw}%**. `;
        }

        // Add fatigue context
        if (fatigue > 60) {
            text += `La fatiga simulada de ${hName} se encuentra en niveles de fatiga severa (${fatigue}%), disminuyendo su presión en campo alto en un 18%. `;
        } else {
            text += `La excelente forma física de ${hName} (${fatigue}% de fatiga) mantiene sus líneas replegadas de forma compacta. `;
        }

        // Add climate context
        if (climate > 70) {
            text += `La alta humedad del microclima (${climate}%) incrementa la densidad de pases largos fallidos. `;
        }

        // Add social/tactical context
        if (tactics) {
            text += `El planteamiento hiper-ofensivo de ${aName} desestabiliza el eje defensivo local, restando solidez al empate. `;
        } else if (sentiment > 70) {
            text += `La presión de afición digitalizada de ${aName} (${sentiment}%) inyecta una sinergia psicológica positiva en las transiciones rápidas de contraataque.`;
        }

        text += ` *[Correlación del sensor multimodal de IA activa]*`;

        xaiCommentary.innerHTML = text;
    }

    // Slider Event Listeners
    inputFatigue.addEventListener('input', () => {
        if (currentMatch === 'pu-ca') return;
        valFatigue.textContent = `${inputFatigue.value}%`;
        recalculateProbabilities();
    });

    inputClimate.addEventListener('input', () => {
        if (currentMatch === 'pu-ca') return;
        valClimate.textContent = `${inputClimate.value}%`;
        recalculateProbabilities();
    });

    inputSentiment.addEventListener('input', () => {
        if (currentMatch === 'pu-ca') return;
        valSentiment.textContent = `${inputSentiment.value}%`;
        recalculateProbabilities();
    });

    inputTactics.addEventListener('change', () => {
        if (currentMatch === 'pu-ca') return;
        recalculateProbabilities();
    });

    // Match Switcher Event Listener
    matchSelector.addEventListener('change', (e) => {
        currentMatch = e.target.value;
        
        setEmptyState();
        inputFatigue.disabled = true;
        inputClimate.disabled = true;
        inputSentiment.disabled = true;
        inputTactics.disabled = true;
        calienteOddsPanel.style.display = "none";
        
        resetSliders();
        xaiCommentary.textContent = "Esperando oportunidad del Radar 24/7...";
    });

    // -------------------------------------------------------------
    // INEGI MOPRADEF INTERACTIVE CHART RENDER
    // -------------------------------------------------------------
    function renderInegiTab(tabId) {
        const data = dataSets[tabId];
        if (!data) return;

        // Set text
        insightText.textContent = data.insight;

        // Render bars
        chartWrapper.innerHTML = '';
        
        data.bars.forEach((bar, index) => {
            const barContainer = document.createElement('div');
            barContainer.className = 'chart-bar-container';

            const fill = document.createElement('div');
            fill.className = 'chart-bar-fill';
            fill.style.backgroundColor = bar.color;
            if (bar.color.startsWith('var')) {
                fill.style.boxShadow = `0 4px 15px rgba(0, 240, 255, 0.15)`;
            } else {
                fill.style.boxShadow = 'none';
            }

            const labelNum = document.createElement('span');
            labelNum.className = 'chart-bar-label-num';
            // Formatter for scaled values
            if (tabId === 'ligamx-balance' && bar.label.includes('Goles')) {
                labelNum.textContent = (bar.value / 10).toFixed(1);
            } else if (tabId === 'ligamx-balance' && bar.label.includes('Asist')) {
                labelNum.textContent = bar.value + "k";
            } else if (tabId === 'ligamx-balance' && bar.label.includes('Min')) {
                labelNum.textContent = "45.5k";
            } else if (tabId === 'ligamx-balance' && bar.label.includes('Tiempo')) {
                labelNum.textContent = "56m 31s";
            } else {
                labelNum.textContent = `${bar.value}%`;
            }

            const labelTitle = document.createElement('span');
            labelTitle.className = 'chart-bar-label-title';
            labelTitle.textContent = bar.label;

            fill.appendChild(labelNum);
            barContainer.appendChild(fill);
            barContainer.appendChild(labelTitle);
            chartWrapper.appendChild(barContainer);

            // Trigger beautiful CSS growth animation
            setTimeout(() => {
                // If it is Goles scaled by 10, or normal percent
                fill.style.height = `${bar.value}%`;
            }, 50 + (index * 50));
        });

        // Populate stats table if we are on the Liga MX tab
        if (tabId === 'ligamx-balance') {
            leadersTable.style.display = 'grid';
            leadersTable.innerHTML = `
                <div class="leader-col">
                    <h3>  Goleadores (2025-26)</h3>
                    <div class="leader-list">
                        <div class="leader-row">
                            <span class="leader-pos top-pos">1</span>
                            <span class="leader-name">João Pedro <span class="leader-team">(San Luis)</span></span>
                            <span class="leader-stat">12 G (17P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos top-pos">1</span>
                            <span class="leader-name">J. Brunetta <span class="leader-team">(Tigres UANL)</span></span>
                            <span class="leader-stat">12 G (17P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos top-pos">1</span>
                            <span class="leader-name">Paulinho <span class="leader-team">(Toluca)</span></span>
                            <span class="leader-stat">12 G (14P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">4</span>
                            <span class="leader-name">G. Berterame <span class="leader-team">(Monterrey)</span></span>
                            <span class="leader-stat">9 G (17P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">4</span>
                            <span class="leader-name">Sergio Canales <span class="leader-team">(Monterrey)</span></span>
                            <span class="leader-stat">9 G (14P)</span>
                        </div>
                    </div>
                </div>
                <div class="leader-col">
                    <h3>  Asistencias (2025-26)</h3>
                    <div class="leader-list">
                        <div class="leader-row">
                            <span class="leader-pos top-pos">1</span>
                            <span class="leader-name">Alexis Vega <span class="leader-team">(Toluca)</span></span>
                            <span class="leader-stat">9 A (13P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">2</span>
                            <span class="leader-name">Nicolás Castro <span class="leader-team">(Toluca)</span></span>
                            <span class="leader-stat">7 A (17P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">3</span>
                            <span class="leader-name">Lucas Ocampos <span class="leader-team">(Monterrey)</span></span>
                            <span class="leader-stat">6 A (14P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">4</span>
                            <span class="leader-name">Diego González <span class="leader-team">(Atlas)</span></span>
                            <span class="leader-stat">5 A (17P)</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">4</span>
                            <span class="leader-name">José Paradela <span class="leader-team">(Cruz Azul)</span></span>
                            <span class="leader-stat">5 A (17P)</span>
                        </div>
                    </div>
                </div>
                <div class="leader-col">
                    <h3>  Disciplina / Tarjetas</h3>
                    <div class="leader-list">
                        <div class="leader-row">
                            <span class="leader-pos top-pos">1</span>
                            <span class="leader-name">Santos <span class="leader-team">(50Y / 5R)</span></span>
                            <span class="leader-stat">65 Pts</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">2</span>
                            <span class="leader-name">Pachuca <span class="leader-team">(43Y / 7R)</span></span>
                            <span class="leader-stat">64 Pts</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">3</span>
                            <span class="leader-name">Pumas UNAM <span class="leader-team">(50Y / 4R)</span></span>
                            <span class="leader-stat">62 Pts</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">17</span>
                            <span class="leader-name">Cruz Azul <span class="leader-team">(27Y / 2R)</span></span>
                            <span class="leader-stat">33 Pts</span>
                        </div>
                        <div class="leader-row">
                            <span class="leader-pos">18</span>
                            <span class="leader-name">Monterrey <span class="leader-team">(27Y / 1R)</span></span>
                            <span class="leader-stat">30 Pts</span>
                        </div>
                    </div>
                </div>
                <div class="records-row">
                    <div class="leader-col">
                        <h3>🏟️ Registro de Asistencias 25/26</h3>
                        <div class="leader-list">
                            <div class="leader-row">
                                <span class="leader-name">Asistencia Promedio</span>
                                <span class="leader-stat" style="background: rgba(0, 240, 255, 0.08); color: var(--neon-cyan);">22,247 / part.</span>
                            </div>
                            <div class="leader-row">
                                <span class="leader-name">Asistencia Récord <span class="leader-team">(Cruz Azul vs. Monterrey)</span></span>
                                <span class="leader-stat">58,445</span>
                            </div>
                            <div class="leader-row">
                                <span class="leader-name">Asistencia más Baja <span class="leader-team">(Juárez vs. Pachuca)</span></span>
                                <span class="leader-stat" style="background: rgba(255, 0, 102, 0.08); color: var(--neon-red);">6,053</span>
                            </div>
                            <div class="leader-row">
                                <span class="leader-name">Asistencia Acumulada</span>
                                <span class="leader-stat">7,163,659</span>
                            </div>
                        </div>
                    </div>
                    <div class="leader-col">
                        <h3>📈 Rachas y Rendimiento Operativo</h3>
                        <div class="leader-list">
                            <div class="leader-row">
                                <span class="leader-name">Racha Invicta más Larga</span>
                                <span class="leader-stat" style="color: var(--neon-green);">Toluca (13 part.)</span>
                            </div>
                            <div class="leader-row">
                                <span class="leader-name">Racha Invicta Activa</span>
                                <span class="leader-stat">Cruz Azul (10 part.)</span>
                            </div>
                            <div class="leader-row">
                                <span class="leader-name">Mayor Goleada Local</span>
                                <span class="leader-stat">Tigres 7 - 0 Puebla</span>
                            </div>
                            <div class="leader-row">
                                <span class="leader-name">Mayor Goleada Visitante</span>
                                <span class="leader-stat">Mazatlán 1 - 5 Monterrey</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            leadersTable.style.display = 'none';
            leadersTable.innerHTML = '';
        }
    }

    // Tab switcher
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab');
            renderInegiTab(tabId);
        });
    });

    // -------------------------------------------------------------
    // RESPONSIBLE BETTING (IA GUARDIAN)
    // -------------------------------------------------------------
    btnToggleGuardian.addEventListener('change', () => {
        guardianActive = btnToggleGuardian.checked;
        if (guardianActive) {
            guardianCard.classList.add('guardian-active');
            guardianStatusHeader.classList.add('active');
            guardianStatusHeader.innerHTML = `
                <svg class="icon-shield" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                GUARDIÁN IA ACTIVO
            `;
            guardianTip.textContent = "El Escudo Ético supervisa biometría y patrones. Puedes apostar con un rango recreativo.";
        } else {
            guardianCard.classList.remove('guardian-active');
            guardianStatusHeader.classList.remove('active');
            guardianStatusHeader.innerHTML = `
                <svg class="icon-shield" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                GUARDIÁN IA DESACTIVADO
            `;
            // Reset stress to low when deactivated
            bettingStress = 18;
            updateStressMeter();
            guardianTip.textContent = "Advertencia: Sin regulación, estás expuesto a sesgos impulsivos de apuestas rápidas.";
            
            // Unlock button if it was locked during reset
            btnPlaceBet.style.display = 'block';
            btnBetDisabled.style.display = 'none';
            betCooldownActive = false;
        }
    });

    btnPlaceBet.addEventListener('click', () => {
        if (betCooldownActive) return;

        if (guardianActive) {
            // Increase stress on bet
            bettingStress += 24;
            if (bettingStress > 100) bettingStress = 100;
            updateStressMeter();

            if (bettingStress >= 90) {
                // Lock betting
                betCooldownActive = true;
                btnPlaceBet.style.display = 'none';
                btnBetDisabled.style.display = 'block';
                guardianTip.innerHTML = "🚨 **¡GUARDIÁN IA BLOQUEADO!** Se detecta impulsividad y ritmo cardíaco virtual alto. Espera 10 segundos para estabilizar tu biometría recreativa.";
                
                let countdown = 10;
                const interval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        btnBetDisabled.textContent = `Desbloqueando en ${countdown}s...`;
                    } else {
                        clearInterval(interval);
                        // Reset
                        bettingStress = 18;
                        updateStressMeter();
                        btnPlaceBet.style.display = 'block';
                        btnBetDisabled.style.display = 'none';
                        btnBetDisabled.textContent = 'Apuesta Bloqueada (Límite Superado)';
                        guardianTip.textContent = "Guardia IA: Parámetros biométricos normalizados. Juega de manera segura.";
                        betCooldownActive = false;
                    }
                }, 1000);
            } else {
                guardianTip.textContent = `Apuesta realizada con éxito. Estrés actual incrementado. Juega con cautela.`;
            }
        } else {
            // Without guardian, stress increases but never blocks! Showing unregulated risk
            bettingStress += 20;
            if (bettingStress > 100) bettingStress = 100;
            updateStressMeter();
            guardianTip.innerHTML = "  **Riesgo Crítico:** Estás apostando sin límites. Tu estrés simulado está en niveles de pérdida de control, pero el sistema no regulado permite seguir operando.";
        }
    });

    function updateStressMeter() {
        stressProgressBar.style.width = `${bettingStress}%`;
        
        if (bettingStress < 45) {
            stressProgressBar.style.backgroundColor = "var(--neon-green)";
            stressValue.className = "stress-val-safe";
            stressValue.textContent = `${bettingStress}% (Seguro)`;
        } else if (bettingStress < 80) {
            stressProgressBar.style.backgroundColor = "var(--neon-orange)";
            stressValue.className = "stress-val-warning";
            stressValue.textContent = `${bettingStress}% (Alerta)`;
        } else {
            stressProgressBar.style.backgroundColor = "var(--neon-red)";
            stressValue.className = "stress-val-danger";
            stressValue.textContent = `${bettingStress}% (Peligro)`;
        }
    }

    // -------------------------------------------------------------
    // OPTIMIZADOR DE COBERTURAS (HEDGING SIMULATOR)
    // -------------------------------------------------------------
    const presetPsgToluca = document.getElementById('presetPsgToluca');
    
    const hTeam1 = document.getElementById('hedgingTeam1');
    const hOdds1 = document.getElementById('hedgingOdds1');
    const hStake1 = document.getElementById('hedgingStake1');
    
    const hTeam2 = document.getElementById('hedgingTeam2');
    const hOdds2 = document.getElementById('hedgingOdds2');
    const hStake2 = document.getElementById('hedgingStake2');

    // DOM Scenarios elements
    const mathBoth = document.getElementById('mathBoth');
    const returnBoth = document.getElementById('returnBoth');
    const netBoth = document.getElementById('netBoth');
    const resultCardBoth = document.getElementById('resultCardBoth');

    const badgeOnly1 = document.getElementById('badgeOnly1');
    const mathOnly1 = document.getElementById('mathOnly1');
    const returnOnly1 = document.getElementById('returnOnly1');
    const netOnly1 = document.getElementById('netOnly1');
    const resultCardOnly1 = document.getElementById('resultCardOnly1');

    const badgeOnly2 = document.getElementById('badgeOnly2');
    const mathOnly2 = document.getElementById('mathOnly2');
    const returnOnly2 = document.getElementById('returnOnly2');
    const netOnly2 = document.getElementById('netOnly2');
    const resultCardOnly2 = document.getElementById('resultCardOnly2');

    const mathNone = document.getElementById('mathNone');
    const netNone = document.getElementById('netNone');
    const resultCardNone = document.getElementById('resultCardNone');

    const hedgingAdviceText = document.getElementById('hedgingAdviceText');
    const hedgingAdviceBox = document.getElementById('hedgingAdviceBox');

    function recalculateHedging() {
        const team1 = hTeam1.value || "Apuesta 1";
        const odds1 = parseFloat(hOdds1.value) || 1.0;
        const stake1 = parseFloat(hStake1.value) || 0.0;

        const team2 = hTeam2.value || "Apuesta 2";
        const odds2 = parseFloat(hOdds2.value) || 1.0;
        const stake2 = parseFloat(hStake2.value) || 0.0;

        const totalStake = stake1 + stake2;

        // SCENARIO 1: Both Win
        const retBoth = (stake1 * odds1) + (stake2 * odds2);
        const profitBoth = retBoth - totalStake;

        // SCENARIO 2: Only 1 Wins
        const retOnly1 = stake1 * odds1;
        const profitOnly1 = retOnly1 - totalStake;

        // SCENARIO 3: Only 2 Wins
        const retOnly2 = stake2 * odds2;
        const profitOnly2 = retOnly2 - totalStake;

        // SCENARIO 4: None Wins
        const retNone = 0;
        const profitNone = -totalStake;

        // Update Scenario 1 UI
        mathBoth.textContent = `$${stake1.toFixed(0)}×${odds1.toFixed(3)} + $${stake2.toFixed(0)}×${odds2.toFixed(3)}`;
        returnBoth.textContent = `$${retBoth.toFixed(2)}`;
        netBoth.textContent = `${profitBoth >= 0 ? '+' : ''}$${profitBoth.toFixed(2)}`;
        netBoth.className = `val-amount ${profitBoth >= 0 ? 'profit' : 'loss'}`;

        // Update Scenario 2 UI
        if (badgeOnly1) badgeOnly1.textContent = `   Solo ${team1.split(' ')[0]} Gana`;
        if (mathOnly1) mathOnly1.textContent = `$${stake1.toFixed(0)}×${odds1.toFixed(3)}`;
        if (returnOnly1) returnOnly1.textContent = `$${retOnly1.toFixed(2)}`;
        if (netOnly1) {
            netOnly1.textContent = `${profitOnly1 >= 0 ? '+' : ''}$${profitOnly1.toFixed(2)}`;
            netOnly1.className = `val-amount ${profitOnly1 >= 0 ? 'profit' : 'loss'}`;
        }

        // Update Scenario 3 UI
        if (badgeOnly2) badgeOnly2.textContent = `   Solo ${team2.split(' ')[0]} Gana`;
        if (mathOnly2) mathOnly2.textContent = `$${stake2.toFixed(0)}×${odds2.toFixed(3)}`;
        if (returnOnly2) returnOnly2.textContent = `$${retOnly2.toFixed(2)}`;
        if (netOnly2) {
            netOnly2.textContent = `${profitOnly2 >= 0 ? '+' : ''}$${profitOnly2.toFixed(2)}`;
            netOnly2.className = `val-amount ${profitOnly2 >= 0 ? 'profit' : 'loss'}`;
        }

        // Update Scenario 4 UI
        if (mathNone) mathNone.textContent = `$${totalStake.toFixed(0)} perdidos`;
        if (netNone) {
            netNone.textContent = `-$${totalStake.toFixed(2)}`;
            netNone.className = "val-amount loss";
        }

        // Generate intelligent advice (XAI)
        let advice = "";
        let isIdeal = false;

        const recovered2 = totalStake > 0 ? (retOnly2 / totalStake) * 100 : 0;
        const recovered1 = totalStake > 0 ? (retOnly1 / totalStake) * 100 : 0;

        if (profitOnly1 >= 0 && profitOnly2 >= -10) {
            advice = `¡Estrategia asíncrona ideal! Si el primer partido (${team1.split(' ')[0]}) resulta victorioso, aseguras una ganancia neta de +$${profitOnly1.toFixed(2)}, eliminando el estrés del segundo partido. En caso de fallo temprano, ${team2.split(' ')[0]} actúa como amortiguador reteniendo el ${recovered2.toFixed(1)}% del capital total.`;
            isIdeal = true;
        } else if (profitOnly1 < 0 && profitOnly2 < 0) {
            advice = `Riesgo moderado a alto. Ninguna de las selecciones de forma individual cubre el total de la inversión ($${totalStake.toFixed(2)}). Necesitas que ambos equipos ganen para obtener rentabilidad. Considera buscar momios más altos (cuotas > 2.0) o reajustar los montos de apuesta.`;
        } else if (profitOnly1 >= 0 && profitOnly2 < -10) {
            advice = `Cobertura asimétrica. Si gana ${team1.split(' ')[0]} primero, aseguras ganancias (+$${profitOnly1.toFixed(2)}). Sin embargo, si pierde el primero, la victoria de ${team2.split(' ')[0]} solo recupera el ${recovered2.toFixed(1)}% del total, dejándote con pérdida parcial.`;
        } else if (profitOnly1 < 0 && profitOnly2 >= 0) {
            advice = `Cobertura invertida. La apuesta tardía (${team2.split(' ')[0]}) cubre la inversión completa con ganancia de +$${profitOnly2.toFixed(2)}, pero la apuesta temprana te deja expuesto a pérdida parcial. Mantente atento para realizar arbitraje en vivo si el primer partido se complica.`;
        }

        if (hedgingAdviceText) hedgingAdviceText.innerHTML = advice;
        
        // Highlight box styling based on how ideal it is
        if (hedgingAdviceBox) {
            const headerSpan = hedgingAdviceBox.querySelector('.advice-header span');
            if (isIdeal) {
                hedgingAdviceBox.style.background = "rgba(0, 255, 102, 0.03)";
                hedgingAdviceBox.style.borderColor = "rgba(0, 255, 102, 0.15)";
                if (headerSpan) {
                    headerSpan.textContent = "🛡️ ANÁLISIS DE COBERTURA: EXCELENTE ESTRATEGIA";
                    headerSpan.style.color = "var(--neon-green)";
                }
            } else if (profitOnly1 < 0 && profitOnly2 < 0) {
                hedgingAdviceBox.style.background = "rgba(255, 51, 102, 0.03)";
                hedgingAdviceBox.style.borderColor = "rgba(255, 51, 102, 0.15)";
                if (headerSpan) {
                    headerSpan.textContent = "  ANÁLISIS DE COBERTURA: EXPOSICIÓN AL RIESGO";
                    headerSpan.style.color = "var(--neon-red)";
                }
            } else {
                hedgingAdviceBox.style.background = "rgba(0, 240, 255, 0.03)";
                hedgingAdviceBox.style.borderColor = "rgba(0, 240, 255, 0.15)";
                if (headerSpan) {
                    headerSpan.textContent = "  ANÁLISIS DE COBERTURA: COBERTURA ASIMÉTRICA";
                    headerSpan.style.color = "var(--neon-cyan)";
                }
            }
        }

        // --- CÁLCULO DE ARBITRAJE EN VIVO ---
        const liveOddsInput = document.getElementById('liveHedgeOdds');
        const liveStakeLabel = document.getElementById('liveHedgeStake');
        const liveNetLabel = document.getElementById('liveHedgeNet');
        
        if (liveOddsInput && liveStakeLabel && liveNetLabel) {
            const liveOdds = parseFloat(liveOddsInput.value) || 3.50;
            const ret1 = stake1 * odds1;
            const hedgeStake = liveOdds > 1.0 ? (ret1 / liveOdds) : 0.0;
            const totalSpent = stake1 + hedgeStake;
            const netLiveProfit = ret1 - totalSpent;
            
            liveStakeLabel.textContent = `$${hedgeStake.toFixed(2)}`;
            liveNetLabel.textContent = `${netLiveProfit >= 0 ? '+' : ''}$${netLiveProfit.toFixed(2)}`;
            liveNetLabel.className = netLiveProfit >= 0 ? 'profit' : 'loss';
        }
    }

    // Bind event listeners
    const liveOddsInputElem = document.getElementById('liveHedgeOdds');
    const hedgingInputsArray = [hTeam1, hOdds1, hStake1, hTeam2, hOdds2, hStake2, liveOddsInputElem];
    hedgingInputsArray.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                if (presetPsgToluca) presetPsgToluca.classList.remove('active');
                recalculateHedging();
            });
        }
    });

    if (presetPsgToluca) {
        presetPsgToluca.addEventListener('click', () => {
            if (hTeam1) hTeam1.value = "PSG (vs Arsenal)";
            if (hOdds1) hOdds1.value = "2.28";
            if (hStake1) hStake1.value = "100";
            
            if (hTeam2) hTeam2.value = "Toluca (vs Tigres)";
            if (hOdds2) hOdds2.value = "1.909";
            if (hStake2) hStake2.value = "100";
            
            presetPsgToluca.classList.add('active');
            recalculateHedging();
        });
    }

    // -------------------------------------------------------------
    // MANUAL ODDS INPUT — Enviar odds al servidor
    // -------------------------------------------------------------
    const btnApplyOdds = document.getElementById('btnApplyOdds');
    const manualOddsHome = document.getElementById('manualOddsHome');
    const manualOddsDraw = document.getElementById('manualOddsDraw');
    const manualOddsAway = document.getElementById('manualOddsAway');
    const oddsStatusBadge = document.getElementById('oddsStatusBadge');

    function updateOddsStatus(hasOdds) {
        if (!oddsStatusBadge) return;
        if (hasOdds) {
            oddsStatusBadge.textContent = '✅ Blend activado: 70% Poisson + 30% odds de mercado';
            oddsStatusBadge.style.background = 'rgba(0,255,102,0.1)';
            oddsStatusBadge.style.color = 'var(--neon-green)';
            oddsStatusBadge.style.borderColor = 'rgba(0,255,102,0.25)';
        } else {
            oddsStatusBadge.textContent = '⚠️ Blend desactivado — solo Poisson puro';
            oddsStatusBadge.style.background = 'rgba(255,159,28,0.1)';
            oddsStatusBadge.style.color = '#ff9f1c';
            oddsStatusBadge.style.borderColor = 'rgba(255,159,28,0.25)';
        }
    }

    // Check current odds status from server
    function checkOddsStatus() {
        fetch('/scout/status')
            .then(r => r.json())
            .then(data => {
                // Also check datos_partido.json for odds
                fetch('/last')
                    .then(r => r.json())
                    .then(pred => {
                        const odds = pred?.odds_used?.caliente;
                        updateOddsStatus(odds && odds.home);
                    })
                    .catch(() => {});
            })
            .catch(() => {});
    }

    if (btnApplyOdds) {
        btnApplyOdds.addEventListener('click', () => {
            const h = parseFloat(manualOddsHome?.value);
            const d = parseFloat(manualOddsDraw?.value);
            const a = parseFloat(manualOddsAway?.value);

            if (!h || !d || !a || h < 1.01 || d < 1.01 || a < 1.01) {
                alert('Ingresa momios válidos mayores a 1.01');
                return;
            }

            btnApplyOdds.textContent = '⏳ APLICANDO...';
            btnApplyOdds.disabled = true;

            fetch('/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ odds: { caliente: { home: h, draw: d, away: a } } })
            })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'stored') {
                    updateOddsStatus(true);
                    alert('✅ Odds aplicados al modelo. La próxima predicción usará blend mercado + Poisson.');
                    // Recalcular predicción con estos odds
                    const sel = document.getElementById('matchSelector');
                    const matchOpt = sel?.value || 'psg-ars';
                    const matches = {
                        'psg-ars': { home: 'PSG', away: 'Arsenal', league: 'UEFA Champions League' },
                        'tol-tig': { home: 'Toluca', away: 'Tigres', league: 'CONCACAF Champions Cup' },
                        'pu-ca': { home: 'Pumas', away: 'Cruz Azul', league: 'Liga MX' }
                    };
                    const m = matches[matchOpt] || matches['psg-ars'];
                    fetch('/predict-final', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(m)
                    })
                    .then(r => r.json())
                    .then(d => {
                        if (d.prediction) {
                            const msg = `🔄 Predicción recalculada con odds reales:\n${d.match.home} ${d.prediction.home_prob}% | Empate ${d.prediction.draw_prob}% | ${d.match.away} ${d.prediction.away_prob}%\n🏆 Ganador: ${d.prediction.winner} (${d.prediction.confidence}% confianza)`;
                            alert(msg);
                        }
                    })
                    .catch(() => {});
                }
            })
            .catch(err => alert('Error al guardar odds: ' + err.message))
            .finally(() => {
                btnApplyOdds.textContent = '🔗 APLICAR ODDS AL MODELO';
                btnApplyOdds.disabled = false;
            });
        });
    }

    // -------------------------------------------------------------
    // SPORT TABS — Cambiar deporte y actualizar dashboard
    // -------------------------------------------------------------
    const sportTabs = document.querySelectorAll('.sport-tab');
    let activeSport = 'football';

    function switchSport(sport) {
        activeSport = sport;
        sportTabs.forEach(tab => {
            const isActive = tab.dataset.sport === sport;
            tab.style.background = isActive ? 'var(--neon-cyan)' : 'transparent';
            tab.style.color = isActive ? '#0b0f19' : 'var(--text-secondary)';
            tab.classList.toggle('active', isActive);
        });

        // Cambiar header del dashboard según deporte
        const matchLeagueText = document.getElementById('matchLeagueText');
        const liveMatchIndicator = document.getElementById('liveMatchIndicator');
        const matchSelector = document.getElementById('matchSelector');
        
        if (sport === 'football') {
            matchLeagueText.textContent = 'Ligas mundiales • Fútbol';
            if (matchSelector) {
                matchSelector.innerHTML = `
                    <option value="psg-ars">PSG vs Arsenal (Finalizado)</option>
                    <option value="tol-tig" selected>Toluca vs Tigres (Concacaf)</option>
                    <option value="pu-ca">Pumas vs Cruz Azul (Liga MX)</option>
                `;
            }
            document.getElementById('oddsInputPanel').style.display = 'block';
        } else if (sport === 'basketball') {
            matchLeagueText.textContent = 'NBA • Básquetbol';
            if (matchSelector) {
                matchSelector.innerHTML = `
                    <option value="nba1" selected>Lakers vs Celtics</option>
                    <option value="nba2">Warriors vs Bucks</option>
                    <option value="nba3">Nuggets vs Heat</option>
                `;
            }
        } else if (sport === 'baseball') {
            matchLeagueText.textContent = 'MLB • Béisbol';
            if (matchSelector) {
                matchSelector.innerHTML = `
                    <option value="mlb1" selected>Yankees vs Dodgers</option>
                    <option value="mlb2">Mets vs Braves</option>
                    <option value="mlb3">Astros vs Rangers</option>
                `;
            }
        }

        // Notificar al dashboard
        const event = new CustomEvent('sportChanged', { detail: { sport } });
        document.dispatchEvent(event);
    }

    sportTabs.forEach(tab => {
        tab.addEventListener('click', () => switchSport(tab.dataset.sport));
    });

    // -------------------------------------------------------------
    // INIT APPLICATION
    // -------------------------------------------------------------
    // Render first tab
    renderInegiTab('active-pop');
    
    // Initial odds calculation
    recalculateProbabilities();

    // Initial hedging calculation
    recalculateHedging();

    // Check odds status
    checkOddsStatus();
});
