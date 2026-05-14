# HUBSPOT - PASO A PASO EN ESPAÑOL
## Configuración Completa del CRM para Montacargas del Norte

---

# PASO 1: CREAR EL PIPELINE DE VENTAS

## 1.1 Acceder a Deals

1. En el menú lateral izquierdo de HubSpot, buscá la sección **"Sales"**
2. Hacé clic en **"Deals"** (puede estar bajo "Ventas" si está en español)
3. Vas a ver una opción que dice **"Create pipeline"** o **"Crear embudo"**

## 1.2 Crear el pipeline

1. Hacé clic en **"Create pipeline"**
2. En el campo de nombre, escribí: **"Renta Montacargas"**
3. Hacé clic en **"Create"**

## 1.3 Agregar las etapas

1. Ya dentro del pipeline, vas a ver las etapas por defecto
2. **Editá** cada etapa o agregá nuevas hasta tener:

| Orden | Nombre de la etapa | Descripción |
|-------|--------------------| ------------|
| 1 | **Lead Nuevo** | Contacto recibido, sin responder |
| 2 | **Qualified** | Contacto interesado, necesita más info |
| 3 | **Proposal Enviada** | Propuesta económica enviada |
| 4 | **Closed Won** | ✅ Contrato firmado |
| 5 | **Closed Lost** | ❌ No cerró (fuera del pipeline) |

**Cómo editar:**
- Hacé clic en el nombre de la etapa → editá → guardá
- Para agregar etapa nueva → buscá botón **"+"** o **"Add stage"**

## 1.4 Visual del pipeline

```
Pipeline: Renta Montacargas

┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Lead Nuevo  │ → │  Qualified   │ → │  Proposal    │ → │  Closed Won  │
│              │   │              │   │  Enviada     │   │     ✅       │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
                                                                   ↓
                                                           ┌──────────────┐
                                                           │ Closed Lost  │
                                                           │     ❌       │
                                                           └──────────────┘
```

---

# PASO 2: AGREGAR CAMPOS PERSONALIZADOS

## 2.1 Acceder a Properties

1. En HubSpot, buscá el **ícono de engranaje** (⚙️) arriba a la derecha
2. En el menú, buscá **"Propiedades"** o **"Properties"**
3. Asegurate de estar en la pestaña **"Negocios"** o **"Deals"**

## 2.2 Crear nuevo campo

1. Hacé clic en **"Crear propiedad"** o **"Create property"**
2. Completá los datos:

**Campo 1: Ciudad**
- Nombre interno: `ciudad`
- Label: `Ciudad`
- Tipo: **Texto** o **Lista de selección** (Single-select)
- Si es lista: agregá opciones: Monterrey, Saltillo, Aguascalientes, San Luis Potosí, Múltiples

**Campo 2: Tipo de equipo**
- Nombre interno: `tipo_equipo`
- Label: `Tipo de equipo`
- Tipo: **Lista de selección**
- Opciones: Eléctrico, Diesel, Torreta, No estoy seguro

**Campo 3: Valor mensual (MXN)**
- Nombre interno: `valor_mensual_mxn`
- Label: `Valor mensual (MXN)`
- Tipo: **Número**

**Campo 4: Fuente del lead**
- Nombre interno: `fuente_lead`
- Label: `Fuente del lead`
- Tipo: **Lista de selección**
- Opciones: LinkedIn, Cold Email, Web, Referido, Google Ads, Otro

**Campo 5: Cantidad de equipos**
- Nombre interno: `cantidad_equipos`
- Label: `Cantidad de equipos`
- Tipo: **Número**

## 2.3 Guardar

- Hacé clic en **"Guardar"** después de cada campo nuevo

---

# PASO 3: CARGAR CONTACTOS

## 3.1 Acceder a Import

1. En el menú, andá a **"Contacts"** o **"Contactos"**
2. Buscá el botón **"Import"** o **"Importar"** (arriba a la derecha)
3. Hacé clic

## 3.2 Tipos de importación

Te va a dar opciones:
- **"Upload CSV"** → si tenés archivo con contactos
- **"From other sources"** → de otras fuentes
- **"Manual entry"** → cargar uno por uno (más lento)

## 3.3 Si usás el template que creé (Google Sheets)

1. Descargá el archivo **LEAD-TRACKER-TEMPLATE.md** de la carpeta del proyecto
2. Exportalo a CSV desde Google Sheets: **Archivo → Descargar → CSV**
3. Subilo en HubSpot
4. Mapeá las columnas con los campos de HubSpot
5. Hacé clic en **"Importar"**

## 3.4 Campos mínimos a incluir por contacto

| Campo | Descripción | Ejemplo |
|-------|------------|---------|
| Nombre | First name | Juan |
| Apellido | Last name | García |
| Email | Correo corporativo | juan@empresa.com |
| Teléfono | Con lada | 8441234567 |
| Empresa | Company name | AutoPartes Saltillo |
| Cargo | Job title | Gerente de Operaciones |
| Ciudad | Ubicación | Saltillo |

---

# PASO 4: CONFIGURAR DASHBOARD

## 4.1 Acceder a Reports

1. En el menú lateral, buscá **"Reports"** o **"Informes"**
2. O accedé a **"Dashboards"** o **"Tableros"**

## 4.2 Crear dashboard nuevo

1. Hacé clic en **"Create dashboard"** o **"Crear tablero"**
2. Nombre: **"Montacargas del Norte - Ventas"**
3. Agregá estos **widgets** básicos:

### Widget 1: Total de Deals por etapa
- Tipo: **Deal pipeline** o **kanban**
- Muestra: todas las etapas con cantidad de deals

### Widget 2: Valor total del pipeline
- Tipo: **Number** o ** número**
- Fórmula: suma de `valor_mensual_mxn` de deals activos

### Widget 3: Leads nuevos (este mes)
- Tipo: **Number**
- Filtro: fecha de creación = este mes

### Widget 4: Tasa de cierre
- Tipo: **Number** (porcentaje)
- Fórmula: Closed Won / (Closed Won + Closed Lost) × 100

---

# PASO 5: INTEGRAR GMAIL (OPCIONAL PERO RECOMENDADO)

## 5.1 Instalar extensión de HubSpot

1. Andá a **Settings → Integrations → Email**
2. Buscá **"Gmail"** o **"Google Workspace"**
3. Hacé clic en **"Install"** o **"Instalar"**
4. Te va a llevar a la Chrome Web Store
5. Install la extensión **"HubSpot Sales"**
6. Abrí Gmail → vas a ver una nueva barra de HubSpot

## 5.2 Conectar cuenta

1. En Gmail, buscá el popup de HubSpot
2. Hacé clic en **"Connect"** o **"Conectar"**
3. Autorizá los permisos
4. Listo — tus emails ahora se trackean automáticos

---

# PASO 6: CONFIGURAR EMAIL TRACKING

## 6.1 Activar tracking

1. En HubSpot, andá a **Settings → Sales → Email**
2. Buscá la opción **"Email tracking"**
3. Activá:
   - ✅ Track email opens
   - ✅ Track link clicks
   - ✅ Show templates in Gmail

## 6.2 Notificaciones

1. Buscá **"Email notifications"**
2. Activá **"Receive notifications when contacts open my emails"**
3. Así vas a saber cuándo alguien abrió tu email

---

# PASO 7: PRIMER CONTACTO (PROBAR TODO)

## 7.1 Crear un contacto de prueba

1. Andá a **Contacts → Create contact**
2. Completá:
   - Nombre: Juan Prueba
   - Email: tu email personal (para probar)
   - Empresa: Empresa de Prueba
3. Guardá

## 7.2 Crear un deal de prueba

1. Andá a **Deals → Create deal**
2. Completá:
   - Deal name: "Prueba - Juan Prueba"
   - Stage: **Lead Nuevo**
   - Ciudad: Monterrey
   - Valor mensual: $20,000
3. Asociá el deal al contacto que acabás de crear
4. Guardá

## 7.3 Mover el deal por las etapas

1. Arrastrá el deal de prueba a **Qualified**
2. Luego a **Proposal Enviada**
3. Finalmente a **Closed Won**
4. Verificá que el dashboard se actualice

---

# CHECKLIST DE CONFIGURACIÓN COMPLETADO

- [ ] Pipeline de deals creado (5 etapas)
- [ ] Campos personalizados creados (5 campos)
- [ ] 1+ contactos cargados
- [ ] 1+ deals creado
- [ ] Gmail connected (opcional)
- [ ] Email tracking activado
- [ ] Dashboard creado
- [ ] Deal de prueba movido por todas las etapas

---

# PRÓXIMOS PASOS DESPUÉS DE CONFIGURAR

1. **Cargar lista de empresas objetivo** (las que van a recibir cold emails)
2. **Crear secuencia de cold emails en HubSpot** o usar GMass
3. **Comenzar a hacer seguimiento** de cada lead que llegue
4. **Revisar dashboard** cada viernes

---

*Guía paso a paso - HubSpot Setup*
*Montacargas del Norte*
*Mayo 2026*