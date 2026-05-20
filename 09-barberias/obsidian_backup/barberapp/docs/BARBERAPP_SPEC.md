# BarberApp — Especificación Técnica (Resumen)

> Espejo de referencia. Proyecto real: `/Users/macbook/Proyectos/09-barberias/`  
> Ver nota principal: [[0-Proyectos/09-Barberias]]

---

## Stack

- Next.js 16.2 + React 19 + Tailwind CSS v4
- Firebase (Firestore + Auth + Storage)
- TypeScript strict
- PWA con `@ducanh2912/next-pwa`
- Deploy: GCP (producción) + Vercel (staging)

---

## Plan de 22 Pasos

| # | Paso | Estado |
|---|------|--------|
| 1 | Next.js 16.2 + React 19 + Tailwind CSS v4 | ✅ |
| 2 | Auth + Firebase Custom Claims + Layout Base | ✅ |
| 3 | Estructura de carpetas + TypeScript types | ✅ |
| 4 | Sistema de roles (4 roles) | ✅ |
| 5 | CRUD Barberías + Candado de Seguridad | ✅ |
| 6 | Gestión de servicios (5 fijos) | ✅ |
| 7 | Motor de horarios/slots | ✅ |
| 8 | Crear/cancelar citas (anti-doble-booking) | ✅ |
| 9 | Sistema de puntos (1pt/$10) | ✅ |
| 10 | Dashboard Admin Barbería | ✅ |
| 11 | Dashboard Barbero | ✅ |
| 12 | WhatsApp Bot (ManyChat Phase 1) | ⏳ |
| 13 | Mensajes automáticos (confirmación, recordatorio) | ⏳ |
| 14 | PWA setup | ✅ |
| 15 | Sistema QR (por barbería + landing /b/[slug]) | ✅ |
| 16 | Testing e2e | ⏳ |
| 17 | Deploy GCP + Docker | ✅ |
| 18 | Documentación final | 🔄 |
| 19 | Capacitación + handoff | ⏳ |
| 20 | n8n Phase 2 (migración WhatsApp) | ⏳ |
| 21 | Multi-Sucursal | ⏳ |
| 22 | (reservado) | — |

---

## Arquitectura Firestore

```
barberias/{id}/
  servicios_activos/{sid}
  citas/{citaId}
usuarios/{uid}
```

---

*Actualizado: 2026-05-11*
