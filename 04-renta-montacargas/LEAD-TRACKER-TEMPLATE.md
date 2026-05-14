# TEMPLATE: LEAD TRACKER - GOOGLE SHEETS
## Montacargas del Norte | B2B Sales Pipeline

---

# INSTRUCCIONES DE USO

1. Hacé una copia de este archivo: **Archivo → Hacer una copia**
2. Guardalo en tu Google Drive
3. Compartí con tu equipo de ventas
4. Actualizá cada vez que haya interacción con un lead

---

# PESTAÑA 1: LEAD TRACKER (Principal)

## Encabezados (fila 1):

```
| Fecha | Empresa | Contacto | Cargo | Email | Teléfono | Ciudad | Tipo Equipo | Capacidad | Cantidad | Duración | Valor Mensual (MXN) | Fuente | Stage | Última Interacción | Próximo Paso | Notas |
```

## Formula para Stage (columna M):

```
=SI(N2="","Lead Nuevo",SI(O2="","Qualified",SI(P2="","Proposal Enviada",SI(Q2="Closed Won","Closed Won",SI(Q2="Closed Lost","Closed Lost","Proposal Enviada")))))
```

## Formula para Valor Pipeline (celda libre arriba):

```
=SUMIF(M2:M100,"Proposal Enviada",L2:L100)
```

## Ejemplo de datos:

| Fecha | Empresa | Contacto | Cargo | Email | Teléfono | Ciudad | Tipo Equipo | Capacidad | Cantidad | Duración | Valor Mensual | Fuente | Stage | Última Interacción | Próximo Paso | Notas |
|-------|---------|---------|-------|-------|----------|--------|-------------|-----------|---------|---------|----------------|--------|-------|-------------------|--------------|-------|
| 01/05/26 | AutoPartes Saltillo | Juan García | Gerente Ops | juan@autopartes.com | 8441234567 | Saltillo | Eléctrico | 2.5 | 3 | Anual | $54,000 | LinkedIn | Proposal Enviada | 05/05/26 | Esperando respuesta |
| 02/05/26 | Manufacturas Visión | Roberto Castillo | Jefe Almacén | roberto@mvision.com | 4449876543 | SLP | Diesel | 3.0 | 2 | Anual | $40,000 | Cold Email | Closed Won | 10/05/26 | Contrato firmado ✅ |
| 03/05/26 | LogiCentro MTY | Ana Sofía | Director Log | ana@logicentro.com | 8123456789 | Monterrey | Eléctrico | 2.5 | 5 | Anual | $90,000 | Web | Qualified | 06/05/26 | Llamada agendada |

---

# PESTAÑA 2: PIPELINE (Kanban simple)

## Tabla de stages con conteo y valor:

| Stage | Cantidad Leads | Valor Total (MXN) | Meta |
|-------|---------------|-------------------|------|
| Lead Nuevo | =COUNTIF(Lead!M:M,"Lead Nuevo") | =SUMIF(Lead!M:M,"Lead Nuevo",Lead!L:L) | 10 |
| Qualified | =COUNTIF(Lead!M:M,"Qualified") | =SUMIF(Lead!M:M,"Qualified",Lead!L:L) | 5 |
| Proposal Enviada | =COUNTIF(Lead!M:M,"Proposal Enviada") | =SUMIF(Lead!M:M,"Proposal Enviada",Lead!L:L) | 3 |
| Closed Won | =COUNTIF(Lead!M:M,"Closed Won") | =SUMIF(Lead!M:M,"Closed Won",Lead!L:L) | 2 |
| Closed Lost | =COUNTIF(Lead!M:M,"Closed Lost") | =SUMIF(Lead!M:M,"Closed Lost",Lead!L:L) | - |

## Formula para conversión:

```
="Tasa cierre: " & ROUND(COUNTIF(Lead!M:M,"Closed Won") / (COUNTIF(Lead!M:M,"Closed Won") + COUNTIF(Lead!M:M,"Closed Lost")) * 100, 0) & "%"
```

---

# PESTAÑA 3: EMAIL TRACKING (Cold Email Sequence)

## Seguimiento de secuencia:

| Email # | Template | Día | Enviar a | Empresa | Status | Enviado | Abierto | Reply |
|---------|----------|-----|---------|---------|--------|---------|--------|-------|
| 1 | Value Prop | 1 | Juan García | AutoPartes Saltillo | ✅ Enviado | 01/05/26 | Sí | No |
| 2 | Case Study | 4 | Juan García | AutoPartes Saltillo | ✅ Enviado | 05/05/26 | Sí | No |
| 3 | Comparativa | 8 | Juan García | AutoPartes Saltillo | ⏳ Pendiente | - | - | - |
| 4 | Testimonio | 12 | Juan García | AutoPartes Saltillo | 🔲 No enviado | - | - | - |
| 5 | Oferta | 18 | Juan García | AutoPartes Saltillo | 🔲 No enviado | - | - | - |
| 6 | Seguimiento | 25 | Juan García | AutoPartes Saltillo | 🔲 No enviado | - | - | - |
| 7 | Breakup | 35 | Juan García | AutoPartes Saltillo | 🔲 No enviado | - | - | - |

---

# PESTAÑA 4: METRICAS SEMANALES

## Registro semanal:

| Semana | Leads Nuevos | Emails Enviados | Respuestas | Proposals | Closings | Revenue | Notas |
|--------|-------------|-----------------|-----------|-----------|---------|---------|-------|
| 01-07 May | 12 | 84 | 6 | 2 | 1 | $40,000 | LinkedIn funcionando |
| 08-14 May | - | - | - | - | - | - | - |
| 15-21 May | - | - | - | - | - | - | - |
| 22-28 May | - | - | - | - | - | - | - |

## KPIs al día:

| Métrica | Valor Actual | Meta | Status |
|---------|-------------|------|--------|
| Leads/mes | 12 | 20 | 🟡 |
| Tasa respuesta | 7% | 10% | 🟢 |
| Tasa conversión | 8% | 20% | 🔴 |
| Revenue/mes | $40,000 | $75,000 | 🟡 |
| Avg deal size | $22,000 | $25,000 | 🟡 |

---

# PESTAÑA 5: EMPRESAS OBJETIVO

## Base de datos deprospección:

| Empresa | Ciudad | Industria | Tamaño | Contacto | Cargo | Email | Teléfono | Estatus | Notas |
|---------|--------|-----------|--------|----------|-------|-------|----------|---------|-------|
| AutoPartes Saltillo | Saltillo | Autopartes | Mediana | Juan García | Gerente Ops | juan@autopartes.com | 8441234567 | Active | 3 equipos, anual |
| Manufacturas Visión | SLP | Alimentos | Grande | Roberto Castillo | Jefe Almacén | roberto@mvision.com | 4449876543 | Closed | YA CLIENTE |
| LogiCentro MTY | Monterrey | Logística | Mediana | Ana Sofía | Director Log | ana@logicentro.com | 8123456789 | Qualified | 5 equipos, cotizando |
| Acero del Norte | Monterrey | Metalurgia | Grande | Carlos Mendoza | Director Ops | carlos@aceronorte.com | 8188889999 | New | 2 equipos diesel |
| Envases del Centro | Aguascalientes | Plásticos | Mediana | María López | Gerente Planta | maria@envases.com | 4491112233 | New | 4 equipos |
| Refacciones GM | Aguascalientes | Autopartes | Grande | Pedro Sánchez | Procurement | pedro@refaccionesgm.com | 4492223344 | New | Proveedor GM |

---

# FUNCIONES ÚTILES

## Para actualizar Stage automáticamente según última interacción:

```
=IF(L2=TODAY()-7,"Follow up needed",IF(L2<TODAY()-14,"Urgent","Active"))
```

## Para contar días desde última interacción:

```
=IF(ISBLANK(O2),"",TODAY()-O2)
```

## Para filtrar por ciudad:

```
=COUNTIF(C:C,"Monterrey")
```

---

# CÓMO COMPARTIR

1. Clic en **Compartilhar** (arriba a la derecha)
2. Agregá emails del equipo
3. Permisos: **Editor** para ventas, **Visor** para demás
4. Opcional: publicá como página web (solo lectura)

---

# BACKUP

Hacer backup semanal:
**Archivo → Hacer una copia → Guardar como XLSX**

---

*Lead Tracker Template - Mayo 2026*
*Montacargas del Norte*
*Versión 1.0*
*Para uso interno*