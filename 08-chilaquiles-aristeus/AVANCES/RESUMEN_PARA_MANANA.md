# 📊 Estado del Proyecto: Aristeus "Artesanos de la Salsa"
**Fecha de corte:** 5 de junio, 2026

## ✅ Última Sesión — Publicación Masiva en Grupos de Facebook

### Implementación técnica
1. **`post-to-groups.js`** — Script de automatización con Puppeteer para publicar en grupos de Facebook con imagen + texto.
2. **`post.js`** — Se añadió `postToGroups()` vía Graph API (cuando la página sea miembro del grupo).
3. **`publicar_programado.js`** — Ahora ejecuta publicación en grupos DESPUÉS de publicar en página + Instagram.
4. **`Dockerfile`** — Actualizado con Chromium para Puppeteer, se copia `post-to-groups.js`.
5. **`.config.json`** — Configurado con `FB_GROUPS` (23 IDs), `PAGE_ID` corregido, nuevo `PAGE_TOKEN`.

### Publicación realizada
- **22 de 23 grupos publicados** con imagen y texto promocional de Aristeus.
- Grupos objetivos: colonias Aviación, Jacarandas, Morales, Saucito, Vasco de Quiroga, Pozos; grupos de comida/ventas en SLP.
- Solo falló: "Turista en Mi Ciudad, San Luis Potosí!" (no permite posts comerciales).

### Flujo actual
```
cron (12:00 y 15:00)
  → publicar_programado.js
      → post.js → Facebook Page + Instagram
      → post-to-groups.js → 22 grupos de Facebook
```

### Próximos pasos
1. Agregar la página Aristeus como miembro de los grupos para que `post.js --groups` también funcione vía API.
2. Agregar más grupos de la lista de Alejandro (en `memanto/`).
3. Configurar respaldo automático.

---
**Nota:** El proyecto pasó de Fase de Lanzamiento a Fase de Activación con presencia en 22+ grupos de Facebook.
