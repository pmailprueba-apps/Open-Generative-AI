# 🔌 GUÍA DE INTEGRACIÓN: CLAUDE CODE + COMPOSIO

Este documento contiene la configuración técnica necesaria para que Claude Code interactúe con las herramientas de Composio (Gmail, WhatsApp, etc.) de forma directa y sin errores de compatibilidad.

## 🔑 CREDENCIALES DE ACCESO
- **API Key (Composio):** `ak_MuW4-1h-7UBOiSHayfBj`
- **Entity ID:** `montacargas_user` (Este es el identificador vital para firmar las peticiones).
- **Gmail Connection ID:** `ca_ar7XOq51VtOf`

## 🛠 MÉTODO DE EJECUCIÓN (API v3.1)
Para evitar errores de compatibilidad con las SDKs cambiantes, se utiliza el endpoint directo de la API REST.

### Endpoint de Ejecución
`POST https://backend.composio.dev/api/v3.1/tools/execute/{tool_slug}`

### Ejemplo de Script (Node.js)
```javascript
const https = require('https');

const data = JSON.stringify({
    arguments: {
        to: 'destinatario@empresa.com',
        subject: 'Asunto del Correo',
        body: 'Contenido del mensaje...'
    },
    connected_account_id: 'ca_ar7XOq51VtOf', // Opcional si solo hay una cuenta
    entity_id: 'montacargas_user'           // Obligatorio
});

const options = {
    hostname: 'backend.composio.dev',
    path: '/api/v3.1/tools/execute/gmail_send_email',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'ak_MuW4-1h-7UBOiSHayfBj'
    }
};

// ... ejecutar request ...
```

## 🚀 ACCIONES REALIZADAS

### Campaña Mayo 2026 - San Luis Potosí

**5 empresas objetivo contactadas:**

| # | Empresa | Contacto | Email | Status | Message ID |
|---|---------|----------|-------|--------|------------|
| 1 | BMW SLP | Harald Gottsche | harald.gottsche@bmw.de | ✓ Enviado | `19debadc856caf8c` |
| 2 | Nestlé | Victor Bautista | victor.bautista@mx.nestle.com | ✓ Enviado | `19debc2b909bb05f` |
| 3 | GM | Mónica García | monica.garcia@gm.com | ✓ Enviado | `19debc2b8ca0d63b` |
| 4 | Mabe | Oscar Mendez | oscar.mendez@mabe.com.mx | ✓ Enviado | `19debc2bbb91af4b` |
| 5 | Ternium | Odra Hernandez | ohernandezr@ternium.com.mx | ✓ Enviado | `19debc4b016247d2` |
| 6 | Ternium | Jessica G Galvan | c.jegalg@ternium.com.mx | ✓ Enviado | `19debc4b0e010ecb` |

**Email usado:** montacargasnorte.oficial@gmail.com
**Tel de contacto:** 6141073188
**Persona发送:** Edgar Gaona - Montacargas del Norte

## ⚠️ Correcciones descubiertas
- diego.martinez@ternium.com NO existe - usar c.jegalg@ternium.com.mx o ohernandezr@ternium.com.mx

## 📝 NOTAS DE MANTENIMIENTO
- Si la SDK da error de "Toolkit version not specified", siempre especificar `toolkitVersion: "latest"`.
- El Entity ID `montacargas_user` es el dueño de todas las conexiones actuales de este proyecto.

---
*Documento generado por Antigravity para la gestión de Montacargas del Norte.*
