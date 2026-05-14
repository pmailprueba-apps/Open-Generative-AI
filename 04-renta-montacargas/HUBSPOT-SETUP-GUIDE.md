# GUÍA: HUBSPOT CRM - CONFIGURACIÓN RÁPIDA
## Montacargas del Norte | B2B Lead Tracking

---

# PASO 1: CREAR CUENTA

1. Ve a **hubspot.com**
2. Clic en "Get started free"
3. Usá el email: `montacargasnorte.oficial@gmail.com`
4. Completá el registro (nombre, empresa, tamaño)

**Plan gratuito incluye:**
- hasta 1,000 contactos
- pipeline de deals
- email tracking
- automatizaciones básicas

---

# PASO 2: CONFIGURAR PIPELINE DE VENTAS

## Ir a: Sales → Deals → Pipeline

### Pipeline: "Renta de Montacargas"

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Etapa 1          Etapa 2          Etapa 3        Etapa 4       │
│  ─────────        ─────────        ─────────      ─────────     │
│                                                                 │
│  Lead Nuevo   →   Qualified    →   Proposal   →   Closed      │
│                  (Calificado)                 Enviado     Won/Lost
│                                                                 │
│  • Contacto    • Necesidad      • Propuesta    • Ganado        │
│    recibido     validada         enviada        $XX,XXX        │
│  • Sin reply    confirm         • Esperando    • Perdido       │
│                 todavía         • respuesta     (no viable)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Configurar cada etapa:

1. Ve a **Settings → Sales → Deals**
2. Clic en "Create pipeline"
3. Nombre: "Renta Montacargas"
4. Agregá las etapas de arriba
5. Guardá

---

# PASO 3: CREAR PROPIEDADES DE DEAL

### Ir a: Settings → Properties → Deals

Agregar estos campos personalizados:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Ciudad | Texto | MTY / Saltillo / AGS / SLP |
| Tipo de equipo | Texto | Eléctrico / Diesel / Torreta |
| Capacidad | Número | 2.5 / 3.0 / 5.0 ton |
| Cantidad equipos | Número | Cuántos necesita |
| Duración contrato | Texto | Mensual / Anual |
| Valor mensual (MXN) | Número | Renta acordada |
| Fuente lead | Texto | LinkedIn / Cold Email / Web / Referido |
| Competidor actual | Texto | Si renta con otro, cuál |

---

# PASO 4: CREAR CONTACTOS

### Ir a: Contacts → Create contact

**Para cada lead nuevo, capturar:**

| Campo | Info |
|-------|------|
| First name | Nombre del contacto |
| Last name | Apellido |
| Email | Corporativo |
| Phone | WhatsApp con lada |
| Company name | Nombre de la empresa |
| Job title | Cargo |
| Ciudad | Ubicación de la operación |
| Lead source | LinkedIn / Cold Email / Web / Referral |

**Tip:** Importá desde Excel si tenés una lista existente.

---

# PASO 5: CREAR COMPANY (EMPRESA)

### Ir a: Companies → Create company

**Para cada empresa nueva:**

| Campo | Info |
|-------|------|
| Company name | Razón social |
| Industry | Manufactura / Logística / Alimentos / etc |
| Number of employees | Tamaño aprox |
| City | Monterrey / Saltillo / AGS / SLP |
| Website | Si tienen |

Depois vinculás los contactos a la empresa.

---

# PASO 6: REGISTRAR ACTIVIDADES

Cada interacción con un lead, registrar:

### Ir a: Contact → Timeline

| Tipo | Cuándo registrar |
|------|-----------------|
| Email enviado | Cada email de la secuencia |
| Email abierto | Cuando abren ( HubSpot trackea solo) |
| Reply | Respuesta del lead |
| Call | Llamada o WhatsApp call |
| Meeting | Junta presencial o Zoom |
| Note | Nota importante |

**Tip:** Instalá la extensión de HubSpot para Gmail y trackea emails automáticamente.

---

# PASO 7: DASHBOARD BÁSICO

### Ir a: Reports → Dashboards → Create dashboard

**Métricas clave para mostrar:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  MONTACARGAS DEL NORTE - SALES DASHBOARD                    │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ Leads totales  │  │ En propuesta   │  │ Tasa cierre   │  │
│  │      45        │  │       8        │  │     22%       │  │
│  │  (este mes)    │  │                │  │              │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                             │
│  Pipeline Value: $1,250,000 MXN                            │
│  Avg deal size: $22,000/mes                                │
│  Avg time to close: 18 días                                │
│                                                             │
│  FUENTES:                                                   │
│  • LinkedIn: 35%                                           │
│  • Cold Email: 40%                                         │
│  • Web: 15%                                                │
│  • Referido: 10%                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# PASO 8: AUTOMATIZACIONES FREE

### Ir a: Automation → Create workflow

**Automatización sugerida:**

```
TRIGGER: New contact created

IF lead source = "Cold Email"
  → Wait 1 day
  → Enroll in "Cold Email Sequence" (Secuencia 7 emails)
  → Send Task: "Follow up in 7 days"

IF no reply after Email 7
  → Move to "Warm list" for future contact

IF reply received
  → Create deal in pipeline
  → Assign to owner
  → Send notification email to sales rep
```

---

# PASO 9: INTEGRACIÓN CON GMAIL

### Ir a: Settings → Integrations → Gmail

1. Clic en "Connect Gmail"
2. Autorizá los permisos
3. Install HubSpot extension en Chrome

**Ahora:**
- Emails desde Gmail se trackean automáticos
- Puedes crear contacts desde el email
- Logging automático de emails en timeline

---

# PASO 10: REPORTES SEMANALES

### Crear reporte semanal:

**Ir a:** Reports → Reports → Create report

**Reporte semanal básico:**

| Métrica | Esta semana | Meta | Status |
|---------|------------|------|--------|
| Leads nuevos | 5 | 7 | 🟡 |
| Emails enviados | 42 | 50 | 🟢 |
| Responses | 3 | 5 | 🟡 |
| Proposals enviados | 1 | 2 | 🟡 |
| Closings | 0 | 1 | 🔴 |
| Revenue | $0 | $22,000 | 🔴 |

---

# CHECKLIST DE CONFIGURACIÓN

- [ ] Cuenta HubSpot creada
- [ ] Pipeline de deals configurado (4 etapas)
- [ ] Propiedades de deal personalizadas creadas
- [ ] Integración Gmail conectada
- [ ] Extension Chrome instalada
- [ ] Primer contacto cargado
- [ ] Dashboard básico creado
- [ ] Automatización de secuencia configurada

---

# PRÓXIMOS PASOS

1. **Cargar contactos existentes** (lista de empresas objetivo)
2. **Configurar email tracking** en Gmail
3. **Comenzar a usar** para cada lead nuevo
4. **Revisar dashboard** cada viernes

---

*HubSpot Setup Guide - Mayo 2026*
*Montacargas del Norte*
*Versión 1.0*