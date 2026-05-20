# BarberApp — AGENTS.md

> Guía de agentes y skills para el proyecto BarberApp.  
> Ver también: [[0-Proyectos/09-Barberias]] — nota principal del proyecto.

---

## Agentes Recomendados por Fase

| Categoría | Skills / Agentes |
|-----------|-----------------|
| Auth/Firebase | `firebase-auth-expert`, `rbac-agent`, `firestore-rules-agent` |
| UI/Frontend | `admin-dashboard-agent`, `barber-dashboard-agent`, `client-dashboard-agent` |
| Lógica negocio | `scheduler-agent`, `transaction-agent`, `loyalty-engine-agent` |
| WhatsApp | `whatsapp-integration-agent`, `n8n-workflow-agent` |
| PWA/QR | `pwa-expert-agent`, `qr-system-agent` |
| Deploy | `vercel-deploy-agent`, `gcp-deploy-agent` |
| Testing | `agent-browser`, `e2e-testing-agent` |

---

## Pendientes Actuales (Mayo 2026)

- [ ] Dashboard Cliente completo (`/usuario/`)
- [ ] Fix AbortError en iPad
- [ ] PWA Push Notifications (Firebase Cloud Messaging)
- [ ] Cloud Functions para recordatorios automáticos
- [ ] WhatsApp Bot (n8n fase 2)

---

## Comandos Rápidos

```bash
npm run dev              # Dev local
npm run dev:emulator     # Con Firebase Emulators
npm run build            # Validar build (OBLIGATORIO antes de push)
npx tsc --noEmit         # Validar TypeScript
git push origin main     # Deploy automático a GCP
```

---

*Ver proyecto real: `/Users/macbook/Proyectos/09-barberias/`*  
*Actualizado: 2026-05-11*
