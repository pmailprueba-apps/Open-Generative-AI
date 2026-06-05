# Cómo obtener el Page Token para publicar

## Paso 1: Abre el Graph API Explorer

1. Ve a: **https://developers.facebook.com/tools/explorer/**
2. Arriba a la derecha, selecciona la app **"Aristeus Publisher"**
3. En el campo de la izquierda, cambia `me?fields=id,name` a **`61589827317028?fields=name`**
4. Donde dice "Token del usuario", haz clic y selecciona **"Aristeus"** (tu página, ID: 61589827317028)
5. Haz clic en **"Generate Access Token"**
6. En la ventana emergente, marca los permisos:
   - **pages_manage_posts**
   - **pages_read_engagement**
   - **instagram_basic**
   - **instagram_content_publish**
7. Confirma

## Paso 2: Copia el token

El token aparece en el campo de texto. Cópialo (empieza con `EAA...`).

## Paso 3: Pégalo en la configuración

Abre el archivo `.config.json` en la carpeta del proyecto y reemplaza `PAGE_TOKEN` con tu token.

```json
{
  "PAGE_ID": "61589827317028",
  "PAGE_TOKEN": "EAA...tu-token-aqui...",
  "IG_USER_ID": ""
}
```

> **Importante:** Si ves `PAGE_ID: "1026436790562506"`, cámbialo a `"61589827317028"`.

> `IG_USER_ID` se autodescubre la primera vez que publiques a Instagram. Si quieres ponerlo manualmente, ve al paso 3b.

### Paso 3b (opcional): Obtener el Instagram Business ID manualmente

En el Graph API Explorer, pega esta URL:
```
https://graph.facebook.com/v25.0/61589827317028?fields=instagram_business_account&access_token=TU_TOKEN
```
Copia el ID numérico que aparece y ponlo en `IG_USER_ID` en `.config.json`.

## Paso 4: Publica en Facebook

```bash
node post.js "🚀 ¡Primer post automatizado de Aristëus!"
```

Con foto:
```bash
node post.js "¿Verdes o rojos?" "assets/IMAGENES/chilaquiles_verdes.png"
```

## Paso 5: Publica en Instagram

```bash
node post.js "¿Verdes o rojos?" "assets/IMAGENES/chilaquiles_verdes.png"
```

Por defecto publica en **Facebook + Instagram** si hay imagen. Para controlar:

```bash
node post.js "Texto" "imagen.png" --fb-only   # Solo Facebook
node post.js "Texto" "imagen.png" --ig-only   # Solo Instagram
```

## Programación semanal

```bash
node semana.js
```

Muestra la semana completa. Para publicar solo el día de hoy (Facebook + Instagram):

```bash
node semana.js hoy          # Facebook + Instagram
node semana.js hoy --fb-only  # Solo Facebook
node semana.js hoy --ig-only  # Solo Instagram
```
