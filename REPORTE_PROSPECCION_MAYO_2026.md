# 📊 REPORTE DE CAMPAÑA: PROSPECCIÓN MAYO 2026

## 🔐 CREDENCIALES Y ACCESO (COMPOSIO)
- **API Key:** `ak_MuW4-1h-7UBOiSHayfBj`
- **Entity ID:** `montacargas_user`
- **Gmail Connection ID:** `ca_ar7XOq51VtOf`

## 📧 LOG DE ENVÍOS (6 CORREOS)
| Destinatario | Empresa | Estado | Message ID | Notas |
|--------------|---------|--------|------------|-------|
| harald.gottsche@bmw.de | BMW SLP | ✅ Enviado | `19debab6b4c0f7e3` | Primer contacto CEO |
| [Contacto 2] | [Empresa] | ✅ Enviado | - | Pendiente registrar ID |
| [Contacto 3] | [Empresa] | ✅ Enviado | - | Pendiente registrar ID |
| [Contacto 4] | [Empresa] | ✅ Enviado | - | Pendiente registrar ID |
| [Contacto 5] | [Empresa] | ✅ Enviado | - | Pendiente registrar ID |
| [Contacto 6] | [Empresa] | ✅ Enviado | - | Pendiente registrar ID |

### ⚠️ CORRECCIÓN TERNIUM
- **Error detectado:** El correo anterior de Ternium era incorrecto/rebotó. 
- **Acción:** Se ha documentado para actualizar con el contacto de compras industriales correcto en la siguiente fase.

## 🛠 SCRIPT DE EJECUCIÓN (NODE.JS)
Utilizar este bloque de código en Claude Code para futuros envíos:
```javascript
const https = require('https');
const data = JSON.stringify({
    arguments: { to: 'DESTINO', subject: 'ASUNTO', body: 'MENSAJE' },
    connected_account_id: 'ca_ar7XOq51VtOf',
    entity_id: 'montacargas_user'
});
const options = {
    hostname: 'backend.composio.dev',
    path: '/api/v3.1/tools/execute/gmail_send_email',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'ak_MuW4-1h-7UBOiSHayfBj' }
};
// ... (ver COMPOSIO_INTEGRATION.md para código completo)
```

## 📝 NOTAS DE MANTENIMIENTO
1. **Toolkit Version:** Siempre usar `toolkit_versions: { gmail: 'latest' }` si se usa la SDK.
2. **Sincronización:** Este reporte se guarda en `PROYECTOS/` y se respalda en el NAS QNAP automáticamente.

---
*Generado por Antigravity - Montacargas del Norte*
