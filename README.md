# 📁 PROYECTOS - Guía General

Este directorio contiene las instrucciones detalladas para cada uno de los 5 proyectos.

---

## 📂 ESTRUCTURA

```
PROYECTOS/
├── 01-zurdo-norteno/
│   └── INSTRUCCIONES.md
├── 02-venta-camaron/
│   └── INSTRUCCIONES.md
├── 03-renta-equipo-sonido/
│   └── INSTRUCCIONES.md
├── 04-renta-montacargas/
│   └── INSTRUCCIONES.md
├── 05-incomparables-norteno/
│   └── INSTRUCCIONES.md
├── 06-venta-chorizo/
│   └── INSTRUCCIONES.md
├── 07-cooking-express/
│   └── INSTRUCCIONES.md
├── 08-chilaquiles-aristeus/
│   └── INSTRUCCIONES.md
├── 09-barberias/
│   └── INSTRUCCIONES.md
├── 10-unas-y-esteticas/
│   └── INSTRUCCIONES.md
├── README.md (este archivo)
├── PLANTILLA.md (plantilla de gestión estándar)
├── COMANDOS-INSTALL.md
└── lanzador.sh (script para lanzar proyectos)
```

---

## 🎯 RESUMEN DE PROYECTOS

| # | Proyecto | Tipo | Status | Prioridad |
|---|----------|------|--------|-----------|
| 1 | Zurdo Norteño | Solista Norteno | Nuevo | Alta |
| 2 | Venta Camarón | E-commerce | Nuevo | Alta |
| 3 | Renta Equipo Sonido | Servicios B2B/B2C | Nuevo | Media |
| 4 | Renta Montacargas | B2B Industrial | Nuevo | Alta |
| 5 | Los Incomparables | Banda Nortena | Existente | Mantenimiento |
| 6 | Venta Chorizo | E-commerce/Tienda | Nuevo | Alta |
| 7 | Cooking Express | Generación de Imágenes IA | Nuevo | Alta |
| 8 | Chilaquiles Aristeus | Restaurante/Tienda SLP | Lanzado | Alta |
| 9 | Cervezas Artesanales | Marca Cerveza Artesanal México | Nuevo | Alta |
| 9 | Barberías | Cadena Barberías México | Nuevo | Alta |

---

## 🚀 CÓMO USAR ESTAS INSTRUCCIONES

### Paso 1: Elegir Proyecto Prioritario
1. Zurdo (storytelling fuerte, lançamento rápido)
2. Venta Camarón (modelo simple, retorno rápido)
3. Montacargas (mayor revenue potential, B2B)

### Paso 2: Leer Instrucciones Completas
Cada archivo INSTRUCCIONES.md contiene:
- Fases numeradas (1-4)
- Días específicos con tareas
- Prompts exactos para usar con Claude Code
- Checklists de completitud
- Métricas de éxito

### Paso 3: Ejecutar con Claude Code
1. Copiar el prompt del documento
2. Pegar en Claude Code
3. Claude ejecutará usando los skills instalados
4. Continuar con siguiente prompt

---

## 📋 SKILLS UTILIZADOS EN TODOS

```
customer-research
competitor-profiling
brand-guidelines
content-strategy
copywriting
seo-audit
page-cro
form-cro
paid-ads
social-content
email-sequence
lead-magnets
cold-email
analytics-tracking
pricing-strategy
mcp-builder
video
image-enhancer
banana
referral-program
churn-prevention
sales-enablement
```

---

## 📊 INSTALACIÓN DE SKILLS

Si necesitas instalar los skills en otra sesión:

```bash
npx skills add coreyhaines31/marketingskills -y && npx skills add composioHQ/awesome-claude-skills -y && npx skills add agricidaniel/banana-claude -y && npx skills add remotion-dev/remotion -y
```

---

## ⏱️ TIMELINE SUGERIDO

### Mes 1: Lanzar 1-2 proyectos
- **Semana 1-2**: Proyecto 1 (Zurdo o Camarón)
- **Semana 3-4**: Proyecto 2

### Mes 2: Escalar proyectos lanzados
- Optimizar lo que está funcionando
- Comenzar Proyecto 3 (si aplica)

### Mes 3: Proyecto 4 (Montacargas)
- Requiere más inversión pero mayor retorno

---

## 💰 INVERSIÓN VS RETORNO

| Proyecto | Inversión Mes 1 | ROI Esperado | Tiempo ROI |
|----------|----------------|--------------|------------|
| Zurdo | $15,000 | 3-5x | 2-3 meses |
| Camarón | $8,000 | 5-10x (temporada) | 1-2 meses |
| Sonido | $20,000 | 2-3x | 3-4 meses |
| Montacargas | $30,000 | 5-10x | 2-4 meses |
| Incomparables | $10,000 | 3-5x | 2-3 meses |

---

## 📞 SIGUIENTE PASO

1. Leer el archivo INSTRUCCIONES.md del proyecto elegido
2. Lanzar con el script: `./lanzador.sh [NUMERO]`
3. O usar el prompt manualmente en Claude Code

---

## 🛠️ HERRAMIENTAS ADICIONALES

### PLANTILLA.md
Plantilla estándar de gestión aplicable a **cualquier proyecto nuevo** que me des en el futuro. Incluye:
- Estructura de 3 fases (Fundación → Lanzamiento → Crecimiento)
- Checklist semanal
- Tabla de métricas
- Formato de entregables

### lanzador.sh
Script para lanzar proyectos rápidamente:
```bash
cd "/Users/macbook/Documents/BLENDER ANT/PROYECTOS"
./lanzador.sh 4  # Lanza proyecto Montacargas
```

---

## ☁️ INFRAESTRUCTURA Y RESPALDO (QNAP NAS)
- **Time Machine:** Respaldo de sistema operativo macOS activo.
- **Qsync (Privada):** Sincronización en tiempo real entre Mac y QNAP.
- **Ubicación:** `/Users/macbook/Documents/BLENDER ANT` -> `PROYECTOS_QNAP` (NAS).

---

*Documento actualizado: Mayo 2026*
*Para uso con Claude Code y los 78 skills instalados*