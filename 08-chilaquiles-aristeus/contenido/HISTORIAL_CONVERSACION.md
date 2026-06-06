# Conversación - Configuración de Publicación Automática Aristëus

## Fecha
3 de Junio de 2026

## Proyecto
08-chilaquiles-aristeus - Publicación automática a Facebook e Instagram

## Resumen
Se configuró un sistema de publicación automática para Chilaquiles Aristëus que publica 2 posts diarios (12:00 PM y 3:00 PM) en Facebook e Instagram.

## Archivos del proyecto

| Archivo | Descripción |
|---------|-------------|
| `post.js` | Script para publicar en Facebook e Instagram vía API Graph |
| `semana.js` | Publicación semanal (legacy) |
| `publicar_programado.js` | Script que lee calendario.json y publica según hora |
| `publicar_qnap.sh` | Versión bash/curl para QNAP (sin Node.js) |
| `.config.json` | Tokens y config (PAGE_TOKEN, IG_USER_ID) |
| `calendario.json` | Calendario con copys para cada día y hora |
| `Dockerfile` | Docker para ejecutar en contenedor |
| `contenido/copias.conf` | Copys en formato legible por bash (QNAP) |
| `contenido/PLAN_SEMANAL.md` | Plan de contenido semanal en markdown |
| `contenido/Lunes/` a `contenido/Domingo/` | Carpetas para imágenes por día |
| `marketing/publicar_flyer.sh` | Script original que tenía IG_ID funcional |

## Configuración en QNAP
- **IP:** 192.168.100.10
- **Usuario:** admin
- **Ruta:** `/share/CACHEDEV1_DATA/aristeus-publisher/`
- **Cron:** 12:00 y 15:00 todos los días
- **Script:** `publicar_qnap.sh`

## IDs importantes
- **Facebook Page ID:** 1026436790562506
- **Instagram Business ID:** 17841447762280051
- **Instagram usuario:** @aristeus.chilaquiles
- **Facebook App ID:** 778108825296741
- **Facebook App:** Aristeus Publisher

## Token
- Obtenido del script `publicar_flyer.sh` (original del proyecto)
- Se usó el Page Token de ese script que ya funcionaba

## Flujo de publicación
1. Script lee la hora actual (12:00 o 15:00)
2. Busca imagen en la carpeta del día correspondiente
3. Toma el copy de `copias.conf` según día y hora
4. Publica foto en Facebook vía multipart upload
5. Obtiene URL de CDN de la foto subida
6. Crea contenedor en Instagram con la URL
7. Publica el contenedor en Instagram
8. Espera 5 segundos entre creación y publicación

## Posts programados (14 semanales)

### Lunes
- 12PM: ¿Verdes o rojos? (chilaquiles tradicionales)
- 3PM: Bolas de Arroz (acompañamiento)

### Martes
- 12PM: El Despertar de Aristëus (salsa roja de chorizo)
- 3PM: Martes de antojo (calidad artesanal)

### Miércoles
- 12PM: Historia de calidad (ingredientes seleccionados)
- 3PM: Mitad de semana (chilaquiles + toritos)

### Jueves
- 12PM: Proteínas (pollo, huevo, arrachera, camarón)
- 3PM: Joyas del Mar (camarones)

### Viernes
- 12PM: Banquete del Patrón (arrachera premium)
- 3PM: Premio de viernes (celebración)

### Sábado
- 12PM: Sábado de antojo (delivery)
- 3PM: Desayuno de verdad (menú completo)

### Domingo
- 12PM: Domingo de chilaquiles (delivery Ruta 57)
- 3PM: Tesoro Dulce (cajeta y chocolate)

## Pendientes
- [ ] El usuario debe proporcionar las imágenes para cada post
- [ ] Validar que el token del script publicar_flyer.sh siga vigente
- [ ] Probar publicación manual cuando haya imágenes
