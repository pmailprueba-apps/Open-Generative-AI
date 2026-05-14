---
title: "BarberApp"
tipo: "SaaS / PWA / Desarrollo"
estado: "activo"
avance: 73
creado: 2026-05-01
actualizado: 2026-05-11
ingresos_objetivo: 5000
ingresos_actuales: 0
repo: "https://github.com/pmailprueba-apps/barberapp-ant"
firebase: "barberapp-ant-2026"
servidor: "34.172.114.2"
tags: [saas, barberia, pwa, firebase, nextjs, typescript]
---

# BarberApp — SaaS Multi-Tenant para Barberías

**Carpeta:** `/Users/macbook/Proyectos/09-barberias`
**Repo:** https://github.com/pmailprueba-apps/barberapp-ant
**Firebase:** `barberapp-ant-2026`
**IP GCP:** `34.172.114.2`
**Servidor GCP:** `barberapp-server` (Compute Engine, Ubuntu 24.04 LTS, e2-micro, región us-central1-a)
**Dominio Producción:** `http://34.172.114.2`
**Estado:** 🟢 Activo (~70-75% completado)
**Tipo:** SaaS / PWA / Desarrollo
**Tags:** #saas #barberia #pwa #firebase #nextjs #typescript

---

## Visión General

Plataforma SaaS multi-tenant para gestionar barberías. Un Super Admin vende/renta el servicio a múltiples barberías. Cada barbería tiene su propio espacio aislado con barberos y clientes.

**Stack:**
- Next.js 16.2 + React 19 + Tailwind CSS v4
- Firebase (Firestore + Auth + Storage)
- TypeScript strict
- PWA con `@ducanh2912/next-pwa`
- Deploy: GCP + Docker (productivo) + Vercel (staging)

---

## Infraestructura GCP

| Componente | Detalle |
|------------|---------|
| **Instancia** | `barberapp-server` (Compute Engine) |
| **Región** | `us-central1-a` |
| **IP Pública** | `34.172.114.2` |
| **SO** | Ubuntu 24.04 LTS |
| **Tipo** | e2-micro |
| **Puerto** | 80 → 3000 (Docker) |
| **SSL** | Nginx Proxy Manager (Let's Encrypt) |

### Docker Config
- **Container:** `barberapp-prod`
- **Imagen:** Multi-stage build (Node 20 Alpine)
- **Restart:** always
- **Logs:** json-file (max 10m, 3 archivos)

### Gestión del Servidor
```bash
# Ver logs
docker logs barberapp-prod

# Reiniciar
docker restart barberapp-prod

# Rebuild
docker compose up -d --build
```

---

## Modelo de Negocio

| Plan | Precio | Incluye |
|------|--------|---------|
| Básico | $299 MXN/mes | 1 barbero, 100 clientes |
| Pro | $599 MXN/mes | 5 barberos, clientes ilimitados, puntos, WhatsApp |
| Cadena | $1,299 MXN/mes | Sucursales ilimitadas, marca blanca, pagos |

---

## Roles y Permisos

| Rol | Código | Acceso |
|-----|--------|-------|
| Super Admin | `superadmin` | TODO: todas las barberías, métricas globales, pagos (solo pmailprueba@gmail.com) |
| Admin | `admin` | Su barbería: agenda, barberos, clientes, métricas |
| Barbero | `barbero` | Su agenda, sus clientes, su calificación |
| Cliente | `usuario` | Sus citas, historial, puntos, perfil |

### Custom Claims en JWT
```typescript
{ role: "superadmin" | "admin" | "barbero" | "cliente", barberia_id: "...", barbero_id: "..." }
```

### Jerarquía
```
superadmin
  └── admin (dueño de barbería)
        └── barbero (empleado)
              └── usuario (persona que se corta)
```

---

## Cuentas de Prueba

| Rol | Email | Contraseña | Redirección |
|-----|-------|------------|-------------|
| Super Admin | `superadmin@prueba.com` | `Prueba123!` | `/superadmin/...` |
| Admin | `admin@prueba.com` | `Prueba123!` | `/admin/dashboard` |
| Barbero | `barbero@prueba.com` | `Prueba123!` | `/barbero/dashboard` |
| Cliente | `cliente@prueba.com` | `Prueba123!` | `/dashboard` |

**Tip:** En dev, usar el botón **Dev Tools (🛠️)** para login con 1 clic.

---

## Funcionalidades Implementadas

### ✅ Completadas

**Autenticación y Roles:**
- Login email/password + Google Sign-In
- Firebase Auth Custom Claims
- Redirección automática por rol post-login
- Middleware de protección de rutas
- Selector de rol `/seleccionar-rol`

**Superadmin Dashboard:**
- Métricas (barberías activas, ingresos, citas)
- Gestión de barberías (crear, editar, suspender)
- Gestión de usuarios
- Logs del sistema
- Pagos y suscripciones

**Admin Dashboard:**
- Dashboard con citas del día, ingresos, clientes, barberos
- Configuración de barbería (nombre, dirección, horarios, TikTok/Facebook)
- Gestión de barberos (alta/baja)
- Gestión de servicios (precios, duración)
- Configuración de horarios por día
- Generación de códigos QR
- Página de métricas

**Barbero Dashboard:**
- Dashboard personal con citas del día
- Vista de ventas diarias
- Marcar citas como completadas

**Usuario/Cliente Dashboard (PARCIAL):**
- Reserva de citas (UI básica, dice "próximamente")
- Vista de código QR personal
- Puntos acumulados (sistema de lealtad)

**Sistema de Reservas:**
- Anti-doble-booking (verificación de horarios)
- 5 servicios fijos: Corte, Barba, Bigote, Afeitado, Facial
- Cancelación con validación de 1 hora previa
- Calificación de citas (1-5 estrellas + comentario)
- Sistema de puntos: 1 punto por cada $10 MXN

**Landing Pública `/b/[slug]`:**
- Info de barbería (nombre, logo, horarios, dirección)
- Botón llamar directamente
- Botón WhatsApp con mensaje preconfigurado
- Botón "Reservar en línea" (redirige a login)
- Detecta día actual y marca "Hoy"

### ⏳ Pendientes

- Dashboard Cliente completo
- Dashboard Super Admin (completar)
- Notificaciones push PWA (Firebase Cloud Messaging)
- Calificaciones y reviews
- Promociones y descuentos
- n8n Phase 2 (migración desde ManyChat)
- Cloud Functions para pagos y recordatorios automáticos
- WhatsApp Bot (ManyChat → n8n)

---

## Arquitectura de Datos

### Firestore — 2 patrones

**Colecciones raíz:**
- `barberias` — documento por barbería
- `usuarios` — documento por usuario (uid de Firebase Auth)

**Sub-colecciones:**
- `barberias/{id}/servicios_activos` — servicios con toggle individual
- `barberias/{id}/citas` — citas de esa barbería

### Por qué sub-colecciones
- `servicios_activos`: permite `updateDoc` individual sin reescribir todo
- `citas`: aísla datos por barbería (seguridad + queries más rápidas)

---

## Motor de Slots

`src/lib/slots.ts` — `generarSlotsBase(horario, duracionMin)` → array de `Slot{hora, disponible}`.

Flujo:
1. `generarSlotsBase(horario, 30)` — genera todos los slots de 30 min
2. `excluirOcupados(slots, citas)` — marca como no-disponibles los slots que overlap
3. `excluirDomingos(slots, diaSemana)` — si `diaSemana === 0`, todos no-disponibles

**Anti-doble-booking:** Consulta citas del mismo día, si existe overlap rechaza con 409.

---

## Sistema de Puntos

- `PUNTOS_POR_PESOS = 10` en `src/lib/constants.ts`
- `acumularPuntos(uid, monto)` → `Math.floor(monto * 10)` puntos
- `canjearPuntos(uid, puntosRequeridos)` → valida y descuenta con `increment(-puntos)`
- **500 puntos** = meta para recompensa

---

## WhatsApp

`src/lib/whatsapp.ts` — Abstraction layer con dos providers:

```typescript
WHATSAPP_PROVIDER=manychat  // fase 1
WHATSAPP_PROVIDER=n8n      // fase 2
```

Para migrar: solo cambiar la variable de entorno.

---

## PWA

- Manifest: `/public/manifest.json`
- Iconos SVG: `/public/icons/icon-192x192.svg` y `icon-512x512.svg`
- Service Worker: generado por `@ducanh2912/next-pwa` en `public/sw.js`
- Solo activo en producción

---

## API Routes Principales

### Barberías
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/barberias` | Listar todas (superadmin) |
| POST | `/api/barberias` | Crear barbería |
| GET | `/api/barberias/[id]` | Detalle |
| PUT | `/api/barberias/[id]` | Actualizar |
| DELETE | `/api/barberias/[id]` | Eliminar |
| POST | `/api/barberias/[id]/logo` | Subir logo |
| GET | `/api/barberias/[id]/servicios` | Listar servicios activos |
| POST | `/api/barberias/[id]/servicios` | Agregar/inicializar servicios |
| PUT | `/api/barberias/[id]/servicios/[sid]` | Toggle activo / actualizar precio |
| GET | `/api/barberias/[id]/disponibilidad?fecha=YYYY-MM-DD` | Slots disponibles |
| GET | `/api/barberias/[id]/citas?fecha=YYYY-MM-DD` | Citas del día |
| POST | `/api/barberias/[id]/citas` | Crear cita (anti-doble-booking) |
| DELETE | `/api/barberias/[id]/citas?citaId=` | Cancelar cita |
| GET | `/api/barberias/[id]/stats` | Dashboard stats |
| GET | `/api/barberias/por-slug/[slug]` | Landing QR pública |

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/set-custom-claims` | Asignar role + barberia_id |
| GET | `/api/auth/me` | Info del usuario desde token |

### Puntos y Mensajes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/puntos` | Obtener puntos del usuario |
| POST | `/api/puntos` | Canjear puntos |
| POST | `/api/mensajes` | Enviar WhatsApp |
| GET/POST | `/api/webhooks/whatsapp` | ManyChat webhook handler |

---

## Dashboard Rutas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/admin/dashboard` | admin | Stats del día + citas |
| `/admin/qr` | admin | Generador de códigos QR |
| `/barbero/dashboard` | barbero | Mis citas del día + ventas |
| `/cliente` | cliente | (esqueleto — pendiente) |
| `/b/[slug]` | público | Landing pública QR |
| `/superadmin` | superadmin | Panel plataforma completa |

---

## Estructura del Proyecto

```
barberapp/
├── src/
│   ├── app/
│   │   ├── (auth)/login, seleccionar-rol
│   │   ├── (dashboard)/admin/, barbero/, usuario/, superadmin/
│   │   ├── api/auth/set-custom-claims/
│   │   └── b/[slug]/page.tsx  ← Landing pública
│   ├── components/
│   │   ├── ui/  (Button, RoleGate, ServiceCard, PuntosBadge)
│   │   └── layouts/ (Sidebar)
│   ├── hooks/
│   │   └── useAuth.tsx  ← AuthContext
│   ├── lib/
│   │   ├── firebase.ts         ← Cliente
│   │   ├── firebase-admin.ts  ← Admin SDK (lazy-load CRÍTICO)
│   │   ├── barberias.ts       ← CRUD barberías
│   │   ├── servicios.ts       ← CRUD servicios_activos
│   │   ├── citas.ts           ← CRUD citas + anti-doble-booking
│   │   ├── slots.ts          ← Motor de slots
│   │   ├── whatsapp.ts        ← Abstraction WhatsApp
│   │   └── constants.ts      ← Puntos, etc.
│   ├── services/
│   │   └── barberiaService, userService, pagoService
│   └── types/
│       ├── firebase.ts  ← Interfaces
│       └── roles.ts     ← Roles + helpers
├── docs/
│   ├── DEPLOY_GCP.md        ← Deploy Google Cloud
│   ├── DEPLOY_VERCEL.md     ← Deploy Vercel
│   ├── HANDOFF.md            ← Guía de capacitación
│   ├── INSTRUCCIONES.md     ← Especificación técnica completa
│   └── NOTESTADO_PROYECTO.md ← Estado actual
└── public/
    ├── manifest.json
    └── icons/
```

---

## Variables de Entorno Obligatorias

```env
# Cliente (NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Admin
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY  # con \n literales
FIREBASE_ADMIN_STORAGE_BUCKET

# WhatsApp
WHATSAPP_PROVIDER=manychat
MANYCHAT_API_KEY
MANYCHAT_VERIFY_TOKEN

# App
NEXT_PUBLIC_APP_URL
```

---

## Comandos Útiles

```bash
npm run dev         # Dev server
npm run dev:emulator  # Con Firebase Emulator
npm run build       # Validar compilación (OBLIGATORIO antes de push)
npx tsc --noEmit   # Validar tipos TypeScript
git push origin main  # Deploy automático
```

---

## Checklist de Pruebas

### 0. Estabilidad del Sistema
- [ ] Navegación Cliente: "Mis Citas" y "Mi Perfil" sin error 404
- [ ] Carga del Chat: interfaz carga correctamente
- [ ] Permisos de Firestore: sin error "Missing or insufficient permissions"
- [ ] Reserva: nombre de barbería aparece por defecto
- [ ] Reserva: servicios y barberos seleccionables (se marcan en dorado)

### 1. Seguridad y Acceso
- [ ] Acceso Admin Pendiente: cuenta nueva muestra "Cuenta Pendiente"
- [ ] Acceso Barbero Pendiente: bloqueado hasta ser asignado
- [ ] Desbloqueo: tras asignación por Super Admin, usuario puede entrar

### 2. Mensajería (Permisos y Filtros)
- [ ] Pestañas por Rol correctas
- [ ] Super Admin puede escribirle a Admins
- [ ] Admin puede escribirle a Super Admin, Barberos y Clientes
- [ ] Barbero puede escribirle a Admin y Clientes
- [ ] Cliente puede escribirle a Admin y Barberos
- [ ] Cliente NO puede ver/escribirle a otros Clientes

### 3. Sistema de Puntos (500 pts)
- [ ] Suma automática al completar cita
- [ ] Barra de progreso visible en Cliente
- [ ] Efecto glow en tarjeta de puntos

### 4. Gestión de Citas (Barbero)
- [ ] Recordatorios: 60 y 30 minutos antes
- [ ] Botón "Comenzar" bloquea otras citas
- [ ] Marcar "No llegó" libera el estado
- [ ] Finalización con notas técnicas
- [ ] Adelantar citas si termina antes
- [ ] Control de retrasos con aviso

### 5. Validación de Personal (Admin)
- [ ] Nuevos barberos aparecen en pendientes
- [ ] Aprobación otorga acceso al dashboard
- [ ] Baja regresa barbero a rol usuario
- [ ] Perfil: barbero puede editar nombre, teléfono, foto

---

## Emergencias

**Build falla en el servidor:**
→ Ver logs de Docker: `docker logs <container_id>`
→ Verificar `.env.local` con las variables correctas.

**API 500 error:**
→ Revisar env vars en el servidor.
→ Ver logs: `docker logs barberapp`

**Firebase Auth no funciona:**
→ Verificar `NEXT_PUBLIC_FIREBASE_*` en `.env.local` del servidor.

**PWA no instala:**
→ Verificar `NEXT_PUBLIC_APP_URL` coincida con el dominio
→ El service worker solo funciona en producción, no en `localhost`

---

## Recursos Adicionales

- [[0-Proyectos/Imagenes|🖼️ Galería de Imágenes — BarberApp]]
- [[0-Recursos/NotebookLM-BarberApp|🧠 NotebookLM — BarberApp Knowledge Base]]
- [[09-barberias/barberapp/CLAUDE.md]]
- [[09-barberias/barberapp/AGENTS.md]]
- [[09-barberias/barberapp/docs/INSTRUCCIONES.md]]
- [[09-barberias/barberapp/docs/HANDOFF.md]]
- [[09-barberias/barberapp/docs/NOTESTADO_PROYECTO.md]]
- [[09-barberias/barberapp/docs/DEPLOY_GCP.md]]
- [[09-barberias/barberapp/docs/DEPLOY_VERCEL.md]]
- [[09-barberias/barberapp/CHECKLIST_PRUEBAS.md]]

---

*Creado: Mayo 2026*
*Manuel Alejandro Ramos Tejada*