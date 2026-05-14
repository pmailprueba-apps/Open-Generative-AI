# BarberApp — CLAUDE.md (Referencia)

> Este archivo es un espejo de referencia del CLAUDE.md real del proyecto.  
> Archivo original: `/Users/macbook/Proyectos/09-barberias/CLAUDE.md`  
> Ver nota principal: [[0-Proyectos/09-Barberias]]

---

## Stack

- **Next.js 16.2** + React 19 + Tailwind CSS v4
- **Firebase** (Firestore + Auth + Storage)
- **TypeScript strict**
- **PWA** — `@ducanh2912/next-pwa`
- **Deploy** — GCP + Docker (producción), Vercel (staging)

---

## Reglas Críticas

1. **Custom Claims**: Roles (`superadmin`, `admin`, `barbero`, `usuario`) via JWT Claims
2. **Lazy Load Admin SDK**: Solo inicializar `firebase-admin` dentro de API routes
3. **Build antes de push**: `npm run build` obligatorio
4. **Estética Premium**: Variables CSS `--gold`, `--dark`, `--card`, `--muted`

---

## Variables de Entorno (Servidor GCP)

```env
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

---

## Cuentas de Prueba

| Rol | Email | Pass |
|-----|-------|------|
| Super Admin | `superadmin@prueba.com` | `Prueba123!` |
| Admin | `admin@prueba.com` | `Prueba123!` |
| Barbero | `barbero@prueba.com` | `Prueba123!` |
| Cliente | `cliente@prueba.com` | `Prueba123!` |

---

*Actualizado: 2026-05-11*
