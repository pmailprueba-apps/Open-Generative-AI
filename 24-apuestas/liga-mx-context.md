# CONTEXTO DE PREDICCIÓN: LIGA MX (2025-2026)

Este documento contiene las reglas estructurales y los factores ambientales (variables multimodales) específicos del fútbol mexicano, diseñados para ser interpretados por el modelo predictivo de APUESTA.IA.

## 1. Estructura del Torneo (Apertura 2025 y Clausura 2026)
Debido a la Copa del Mundo 2026, el formato de la Liga MX sufrió modificaciones importantes que alteran la motivación y el Expected Value (EV) de los equipos en la recta final del torneo:
- **Eliminación del Play-In (Repechaje):** Se abolió el formato de Play-In. Ahora, la clasificación vuelve al sistema tradicional donde **solo los 8 primeros lugares avanzan directamente a la Liguilla** (Cuartos de Final: 1 vs 8, 2 vs 7, etc.).
- **Impacto Estadístico:** Al no haber reclasificación para los lugares 9 y 10, los partidos de las jornadas 15, 16 y 17 tienen un peso matemático mucho mayor (mayor varianza y desesperación). Los equipos entre la posición 7 y 10 tendrán una "motivación de supervivencia" que debe ajustar su ELO temporalmente hacia arriba.

## 2. Factor Multimodal: Altitud y Localía
En la Liga MX, la ventaja de localía (típicamente evaluada en +15% a nivel global) sufre alteraciones severas por factores geográficos:
- **Equipos de Gran Altitud (>2,000 metros):** Toluca (Estadio Nemesio Díez), Pumas UNAM (Olímpico Universitario), Club América y Cruz Azul (Estadio Ciudad de los Deportes/Azteca).
- **Impacto en Poisson:** Los equipos visitantes a nivel del mar (ej. Mazatlán, Tijuana, Tigres, Monterrey) sufren un decrecimiento aeróbico en el segundo tiempo contra equipos de altura. 
- **Regla del Analista:** Al evaluar un enfrentamiento donde el Local es de "Gran Altitud" y el Visitante es de "Nivel del Mar", el factor de localía (Home Advantage) debe incrementarse matemáticamente del **1.15 al 1.22**. 

## 3. Comportamiento Táctico en Liguilla
Los enfrentamientos de Liguilla (Cuartos de final en adelante) son a visita recíproca. 
- **Criterio de Desempate:** Si hay empate global en Cuartos de Final o Semifinales, avanza el equipo mejor posicionado en la tabla general. (Ya no existe el gol de visitante).
- **Ajuste de Riesgo:** El equipo peor posicionado asume mayores riesgos (aumentando su $\lambda$ de ataque y reduciendo su defensa) en los últimos 30 minutos del partido de vuelta si el global está empatado.

## 4. Equipos y Referencias ELO Base (Aproximaciones 2026)
Para la calibración de modelos, se asumen los siguientes bloques de poder:
- **Tier 1 (Poder Económico/Plantilla):** Club América, Monterrey, Tigres, Cruz Azul.
- **Tier 2 (Competitivos/Locales Fuertes):** Toluca, Pumas UNAM, Chivas, Pachuca.
- **Tier 3 (Media Tabla/Volátiles):** León, Santos Laguna, Necaxa, Atlético San Luis, Xolos de Tijuana.
- **Tier 4 (Bajo Presupuesto/Lucha por cociente):** Mazatlán, FC Juárez, Querétaro, Puebla.

Al calcular el EV+ usando Caliente.mx para la Liga MX, el Analista debe penalizar a los equipos del "Tier 1" cuando juegan de visita en plazas de "Gran Altitud" si el momio del mercado los da como favoritos absolutos, ya que ahí reside el mayor Valor Esperado a favor del local o el empate.
