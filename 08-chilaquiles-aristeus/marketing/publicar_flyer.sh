#!/bin/bash

# Este script publica automáticamente una imagen y un texto en Facebook e Instagram para Aristeus.

PAGE_ID="1026436790562506"
IG_ID="17841447762280051"
PAGE_TOKEN="EAALDr5Qg32UBRpjFzEhQP3M5qgZCZAYIxYWurlPiPZALGTJgj67WSqK49jCpr9z555WlrgVFQp5i41bQWnDUlVcKd5qj5fT6ccYIXZCFaZBCzaVwdQNmBTev4uyO2hj5iBYoy2SopGrsE33ypoaL47MYHmntwD7QiQl7pm8sRvbT5CfRMKWepTmQ7Si9lnCbdsIZBvuqZCTsU49kxZA1QL1MlClZAOYi9HjWoLl9YgMjZB"

echo "🤖 Iniciando Bot de Publicación para Aristeus (Facebook + Instagram)..."
echo "------------------------------------------------------------------------"

# Verificar si se pasó una imagen como argumento
if [ -z "$1" ]; then
    echo "❌ Error: Olvidaste indicar qué flyer quieres publicar."
    echo "👉 Uso correcto: ./publicar_flyer.sh \"/ruta/a/tu/imagen.png\""
    exit 1
fi

IMAGEN="$1"

# Verificar que el archivo realmente existe en la computadora
if [ ! -f "$IMAGEN" ]; then
    echo "❌ Error: No puedo encontrar el archivo en la ruta: $IMAGEN"
    echo "Revisa que la ruta esté bien escrita."
    exit 1
fi

echo "📸 Imagen seleccionada: $IMAGEN"
echo "📝 Preparando la publicación..."

# --- AQUÍ PUEDES EDITAR EL TEXTO DE TU PUBLICACIÓN ---
COPY="☀️ ¡Mañana es el día perfecto para despertar como un rey! ☀️

Empieza tu mañana con la energía que solo El Despertar de Aristëus te puede dar. 
Deliciosos chilaquiles bañados en nuestra salsa roja secreta, con cremita, queso espolvoreado y el toque de la casa. 👑

📍 Te esperamos mañana para desayunar delicioso.
📲 WhatsApp para pedidos: 55 6148 5296
🛵 ¡También encuéntranos en Uber Eats!"
# -----------------------------------------------------

echo "🚀 1. Publicando en Facebook..."

FB_RES=$(curl -s -X POST "https://graph.facebook.com/v19.0/$PAGE_ID/photos" \
     -F "message=$COPY" \
     -F "source=@$IMAGEN" \
     -F "access_token=$PAGE_TOKEN")

PHOTO_ID=$(echo $FB_RES | jq -r '.id')
POST_ID=$(echo $FB_RES | jq -r '.post_id')

if [ -z "$PHOTO_ID" ] || [ "$PHOTO_ID" == "null" ]; then
    echo "❌ Error al publicar en Facebook."
    echo "Respuesta de la API: $FB_RES"
    exit 1
fi

echo "✅ ¡Publicado en Facebook con éxito! (Photo ID: $PHOTO_ID)"

echo "🔗 2. Obteniendo URL de la imagen en los servidores de Meta..."
CDN_RES=$(curl -s "https://graph.facebook.com/v19.0/$PHOTO_ID?fields=images&access_token=$PAGE_TOKEN")
IMG_URL=$(echo $CDN_RES | jq -r '.images[0].source')

if [ -z "$IMG_URL" ] || [ "$IMG_URL" == "null" ]; then
    echo "❌ Error al obtener el enlace de la imagen."
    echo "Respuesta de la API: $CDN_RES"
    exit 1
fi

echo "🚀 3. Creando contenedor de contenido en Instagram..."
IG_CON_RES=$(curl -s -X POST "https://graph.facebook.com/v19.0/$IG_ID/media" \
     --data-urlencode "image_url=$IMG_URL" \
     --data-urlencode "caption=$COPY" \
     --data-urlencode "access_token=$PAGE_TOKEN")

CONTAINER_ID=$(echo $IG_CON_RES | jq -r '.id')

if [ -z "$CONTAINER_ID" ] || [ "$CONTAINER_ID" == "null" ]; then
    echo "❌ Error al crear el contenedor en Instagram."
    echo "Respuesta de la API: $IG_CON_RES"
    exit 1
fi

echo "⏳ Esperando 5 segundos a que Instagram procese la imagen..."
sleep 5

echo "🚀 4. Publicando en Instagram..."
IG_PUB_RES=$(curl -s -X POST "https://graph.facebook.com/v19.0/$IG_ID/media_publish" \
     -F "creation_id=$CONTAINER_ID" \
     -F "access_token=$PAGE_TOKEN")

PUBLISH_ID=$(echo $IG_PUB_RES | jq -r '.id')

if [ -z "$PUBLISH_ID" ] || [ "$PUBLISH_ID" == "null" ]; then
    echo "❌ Error al publicar en Instagram."
    echo "Respuesta de la API: $IG_PUB_RES"
    exit 1
fi

echo "✅ ¡Publicado en Instagram con éxito! (Post ID: $PUBLISH_ID)"
echo "------------------------------------------------------------------------"
echo "🎉 ¡Todo listo! La publicación se realizó con éxito en ambas redes sociales:"
echo "👉 Facebook: https://facebook.com/$PAGE_ID"
echo "👉 Instagram: https://instagram.com/aristeus.chilaquiles"
