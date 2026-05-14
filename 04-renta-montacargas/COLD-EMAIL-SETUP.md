# GUÍA: COLD EMAIL - CONFIGURACIÓN DE ENVÍO GRATIS
## Montacargas del Norte | Secuencia de 7 Emails

---

# OPCIONES DE ENVÍO GRATIS

## Opción 1: G SUITE / GOOGLE WORKSPACE (RECOMENDADA)

### Configuración:

1. **Crear cuenta de Google Workspace**
   - Ve a workspace.google.com
   - Plan Business Starter: $6 USD/mes por usuario
   - Incluye: email@montacargasnorte.com
   - **500 emails/día** de envío

2. **Conectar dominio personalizado**
   - Comprá dominio: montacargasnorte.com ($10-15/año en Namecheap/GoDaddy)
   - Verificá propiedad en Google Workspace
   - Configurá registros MX para emails

3. **Enviar emails:**
   - Desde **Gmail** con interfaz conocida
   - O desde **Google Sheets + Add-on** para automatización

---

## Opción 2: HUNTER.IO (GRATIS)

### Características:
- **100 searches/mes** gratis (verificación de emails)
- **30 emails/mes** gratis en plan gratuito
- Ideal para validar emails antes de enviar

### Cómo usar:

1. Ve a **hunter.io**
2. Registrate gratis
3. Buscá empresas: "site:linkedin.com company \"manufactura\" Monterrey"
4. Verificá emails con **Email Finder**
5. Exportá lista

---

## Opción 3: MAILTRACK (GRATIS)

### Características:
- Email tracking (opens, clicks)
- Limitado a 50 emails/mes
- Integración con Gmail

### Cómo instalar:

1. Ve a **mailtrack.io**
2. Install Chrome extension
3. Conectá tu cuenta Gmail
4. Listo — cada email enviado muestra ✓✓ cuando abre

---

## Opción 4: Lemwarm (GRATIS)

### Características:
- Calienta tu dominio de email para evitar spam
- **200 emails warmup/mes** gratis

### Cómo configurar:

1. Ve a **lemwarm.com**
2. Conectá tu dominio de email
3. Dejá corriendo 2-3 semanas antes de enviar en volumen

---

# CÓMO CARGAR LA SECUENCIA DE 7 EMAILS

## Paso 1: Elegir herramienta de envío masivo

| Herramienta | Free Tier | Costo | Fácil uso |
|-------------|-----------|-------|----------|
| Mailshake | 50 emails/mes | $20/mes luego | ⭐⭐⭐⭐ |
| Lemlist | 100 emails/mes | $49/mes luego | ⭐⭐⭐⭐⭐ |
| Woodpecker | 50 emails/mes | $25/mes luego | ⭐⭐⭐⭐ |
| GMass (Gmail) | 50 emails/día | $25/mes | ⭐⭐⭐⭐⭐ |

**Recomendación para empezar:** GMass (expansión de Gmail, muy fácil)

---

## Paso 2: ConfigurarGMass en Gmail

1. Install **GMass** desde Chrome Web Store
2. Abrí Gmail
3. Vas a ver botón **GMass** en toolbar
4. Clic en **Setup** para configurar

---

## Paso 3: Subir base de datos deempresas

```
Empresa,Nombre,Apellido,Email,Cargo,Ciudad,Empresa Competidora
AutoPartes Saltillo,Juan,García,juan@autopartes.com,Gerente de Operaciones,Saltillo,SEIL
Manufacturas Norte,Carlos,Mendoza,carlos@mfrasnorte.com,Director Logistica,Monterrey,MAC
LogiCentro,Ana,Sofía,ana@logicentro.com,Gerente Logistica,Monterrey,Momatt
```

**Formato:** CSV o importá directo desde Google Sheets

---

## Paso 4: Configurar secuencia en GMass

### Setup del campaign:

```
Campaign Name: Cold Email - Manufacturas MTY/Saltillo
Subject Line: {{first_name}}, una pregunta sobre tus montacargas en {{city}}
Preheader: Cobertura en 4 ciudades con un solo proveedor
```

### Daily sending limit: 25-30 emails/día

(Para no activar spam filters — empezar lento y aumentar)

---

## Paso 5: Personalización con variables

```
{{first_name}} → Juan
{{company}} → AutoPartes Saltillo
{{city}} → Saltillo
{{competitor}} → SEIL
{{signal}} → expansión a nueva planta en enero
```

---

# LA SECUENCIA DE 7 EMAILS

## EMAIL 1: VALUE PROPOSITION
**Día 1**

**Subject:** Una pregunta sobre tus montacargas en {{city}}

```
Hola {{first_name}},

Vi que {{company}} acaba de {{signal}}. Eso típicamente significa más presión sobre el equipo de manejo de materiales.

La mayoría de las empresas con las que hablamos tienen montacargas de 3-5 equipos operando en múltiples plantas. El problema más común: tienen que coordinar con 2-3 proveedores diferentes dependiendo de la ciudad.

Nosotros ofrecemos algo que casi nadie más tiene en el noreste:

Cobertura en 4 ciudades con un solo proveedor — Monterrey, Saltillo, Aguascalientes y San Luis Potosí. Un contrato, una factura, un contacto directo.

Incluye mantenimiento preventivo en todos los equipos. Cuando un montacargas se descompone a media operación, el costo no es solo la reparación — es el paro de producción.

¿Te interesa que te mande un resumen de cómo funciona para empresas como {{company}}?

Saludos,
[Tu nombre]
```

---

## EMAIL 2: CASE STUDY
**Día 4**

**Subject:** El caso de AutoPartes Saltillo

```
Hola {{first_name}},

Hace 6 meses, AutoPartes Saltillo tenía el mismo problema que muchas manufactureras: montacargas propios que se descompomponían constantemente y un proveedor externo que no daba mantenimiento preventivo.

Después de cambiarse a nosotros:
- $180,000 MXN ahorrados en mantenimientos correctivos (año 1)
- 0 paros de producción por falla de montacargas
- 3 plantas atendidas con un solo contacto

El gerente de operaciones当时dijo algo que me ha quedado: "Nunca había tenido un proveedor que me llamara antes de que algo se rompiera."

Estamos generando el mismo resultado para empresas en Monterrey, Saltillo y San Luis Potosí.

¿Quieres que te mande el caso completo con los números?

Saludos,
[Tu nombre]
```

---

## EMAIL 3: COMPARATIVA
**Día 8**

**Subject:** Los números que nadie te cuentan

```
Hola {{first_name}},

Hicimos un análisis para un cliente potencial el mes pasado. Compararon rentar vs comprar 5 montacargas durante 3 años.

**Comprar (5 equipos, 3 años):**
- Inversión inicial: $2.5 millones MXN
- Mantenimiento preventivo: $120,000/año
- Mantenimiento correctivo (promedio): $80,000/año
- Rescate al año 3: ~40% del valor original

**Rentar (5 equipos, 3 años):**
- Inversión inicial: $0
- Mantenimiento: incluido
- Costo total: $540,000/año ($810,000 en 18 meses vs comprar)
- Flexibilidad: puedo cambiar equipos si necesidades cambian

La diferencia real no es el costo mensual — es el **capital liberado** y el **riesgo de equipos parados**.

Te paso la calculadora ROI que usamos. ¿Quieres verla con los números de {{company}}?

Saludos,
[Tu nombre]
```

---

## EMAIL 4: TESTIMONIO
**Día 12**

**Subject:** Lo que dice el equipo de Manufacturas Visión

```
Hola {{first_name}},

Te copio un mensaje que nos mandó esta semana el jefe de almacén de Manufacturas Visión en SLP:

"Llevamos 8 meses con Montacargas Norte y lo que más valoro es que me llaman cada mes para revisar el estado de los equipos. Hace años que teníamos proveedores y nunca nos hacían eso.

La última vez que tuvimos un problema (un montacargas que no prendía), llegaron en 2 horas con un equipo de respaldo. No pedimos ayuda. Ellos vieron la alerta de mantenimiento y llegaron primero.

Para mí eso es la diferencia entre un proveedor y un socio."
— Roberto Castillo, Jefe de Almacén, Manufacturas Visión SLP

Si quieres, puedo ponerlo en contacto con Roberto para que te cuente su experiencia directamente.

Saludos,
[Tu nombre]
```

---

## EMAIL 5: OFERTA
**Día 18**

**Subject:** Oferta para empresas que arrancan antes de julio

```
Hola {{first_name}},

Estamos lanzando cobertura en Aguascalientes este mes. Para las primeras 10 empresas que firmen contrato antes del 30 de junio, tenemos una oferta directa:

Renta tu primer mes + mantenimiento preventivo del mes 2 gratis.

No es un descuento — es que quieras probar sin compromiso. Si después del primer mes decides que no es para ti, te devolvemos el segundo mes de mantenimiento. Sin preguntas.

La oferta está pensada para empresas que quieren probar un proveedor sin riesgo. ¿Te interesa que te mande los detalles?

Saludos,
[Tu nombre]

P.D. Si ya tienes presupuesto aprobado para esto quarter, perfecto. Si no, también vale — podemos empezar la conversación para cuando tengas luz verde.
```

---

## EMAIL 6: SEGUIMIENTO
**Día 25**

**Subject:** La pregunta que me hace siempre el equipo de ops

```
Hola {{first_name}},

Hay una pregunta que me hacen mucho en las primeras juntas: "¿Qué pasa si necesito un equipo extra por una temporada?"

La respuesta: lo resolvemos. No cobramos extra por eso. Si de repente tienes un proyecto con más volumen, mandamos equipos adicionales. Si el proyecto termina, los regresamos.

La mayoría de los contratos de renta en el mercado son rígidos — pagas por 12 meses aunque no uses los equipos. Nosotros no trabajamos así.

¿Hay algún momento específico del año donde {{company}} tiene picos de operación que son difíciles de cubrir?

Saludos,
[Tu nombre]
```

---

## EMAIL 7: BREAKUP
**Día 35**

**Subject:** Un dato sobre tu zona

```
Hola {{first_name}},

He estado escribiendo pero no he tenido respuesta. No pasa nada — entiendo que estés ocupado.

Te mando un dato rápido: en {{city}}, tenemos empresas de manufactura como {{competitor}} operando con nosotros. Si alguna vez necesitas cobertura en las 4 ciudades del noreste o quieres comparar precios, aquí estaremos.

Si no es relevante para ti ahora, sin problema. Pero si cambia algo en el equipo de operaciones, guárdame como contacto.

Saludos,
[Tu nombre]
```

---

# CHECKLIST DE CONFIGURACIÓN

- [ ] Dominio propio comprado (montacargasnorte.com)
- [ ] Google Workspace configurado
- [ ] Lemwarm corriendo para warms up (2-3 semanas)
- [ ] GMass o herramienta de envío instalada
- [ ] Base de datos deempresas cargada
- [ ] Secuencia de 7 emails configurada
- [ ] Daily limit: 25-30 emails/día
- [ ] Tracking de opens activado (Mailtrack o similar)

---

# MEJORES PRÁCTICAS

## Para no ir a spam:
1. **Warming up** el dominio 2-3 semanas antes (Lemwarm)
2. **No enviar todos los emails a la vez** — distribuí durante el día
3. **Personalizá** el subject con nombre de la persona/empresa
4. **No uses palabras spam**: "gratis", "oferta", "descuento", "urgente"
5. **HTML simple** — sin imágenes grandes ni muchos links

## Para mejorar reply rate:
1. **Subject lines cortas y curiosas** (2-4 palabras)
2. **Primera línea personal** — referencia algo de su empresa
3. **Un solo ask** por email
4. **Follow up sequence** de 3-5 emails (ya incluida)

---

# MÉTRICAS A MONITOREAR

| Métrica | Bueno | Malo |
|---------|-------|------|
| Tasa apertura | 25-35% | <15% |
| Tasa respuesta | 5-10% | <2% |
| Tasa unsubscribe | <0.5% | >1% |
| Spam score | <5% | >10% |

---

*Cold Email Setup Guide - Mayo 2026*
*Montacargas del Norte*
*Versión 1.0*