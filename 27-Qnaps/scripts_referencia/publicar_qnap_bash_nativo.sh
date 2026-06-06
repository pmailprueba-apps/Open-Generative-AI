#!/bin/bash
# ==========================================
# PUBLICADOR AUTOMÁTICO QNAP (BASH/CURL)
# ==========================================
# No requiere Node.js ni Docker.

cd /share/CACHEDEV1_DATA/aristeus-publisher || exit 1

LOGFILE="logs/cron_post.log"
mkdir -p logs

DIA=$(date '+%w')
HORA=$(date '+%H')

case "$DIA" in
  0) DIA_ES="Domingo" ; DIA_KEY="Domingo" ;;
  1) DIA_ES="Lunes" ; DIA_KEY="Lunes" ;;
  2) DIA_ES="Martes" ; DIA_KEY="Martes" ;;
  3) DIA_ES="Miércoles" ; DIA_KEY="Miercoles" ;;
  4) DIA_ES="Jueves" ; DIA_KEY="Jueves" ;;
  5) DIA_ES="Viernes" ; DIA_KEY="Viernes" ;;
  6) DIA_ES="Sábado" ; DIA_KEY="Sabado" ;;
esac

IDX=0
if [ "$HORA" -ge 14 ]; then
  IDX=1
  HORA_KEY="15"
else
  HORA_KEY="12"
fi

CLAVE="${DIA_KEY}_${HORA_KEY}"

LINEA=$(grep "^${CLAVE}|" contenido/copias.conf)
if [ -z "$LINEA" ]; then
  echo "[$(date)] ⚠️ No hay copy para $CLAVE" >> "$LOGFILE"
  exit 0
fi

COPY=$(echo "$LINEA" | cut -d'|' -f2- | sed 's/||/\n/g')

CARPETA="contenido/$DIA_ES"
if [ ! -d "$CARPETA" ]; then
  echo "[$(date)] ⚠️ Carpeta $CARPETA no existe" >> "$LOGFILE"
  exit 0
fi

IMAGEN=$(ls -1 "$CARPETA" | grep -iE '\.(png|jpe?g)$' | sort | sed -n "$((IDX+1))p")
if [ -z "$IMAGEN" ]; then
  IMAGEN=$(ls -1 "$CARPETA" | grep -iE '\.(png|jpe?g)$' | sort | head -n 1)
fi

if [ -z "$IMAGEN" ]; then
  echo "[$(date)] ⚠️ No se encontró imagen" >> "$LOGFILE"
  exit 0
fi

IMAGE_PATH="$CARPETA/$IMAGEN"

PAGE_ID=$(grep -o '"PAGE_ID": "[^"]*' .config.json | cut -d'"' -f4)
PAGE_TOKEN=$(grep -o '"PAGE_TOKEN": "[^"]*' .config.json | cut -d'"' -f4)
IG_ID=$(grep -o '"IG_USER_ID": "[^"]*' .config.json | cut -d'"' -f4)

echo "==========================================" >> "$LOGFILE"
echo "[$(date)] 🚀 Publicando $CLAVE" >> "$LOGFILE"

FB_PHOTO_RES=$(curl -s -X POST -F "access_token=$PAGE_TOKEN" -F "published=false" -F "source=@$IMAGE_PATH" "https://graph.facebook.com/v19.0/$PAGE_ID/photos")
FB_PHOTO_ID=$(echo "$FB_PHOTO_RES" | grep -Eo '"id":\s*"[0-9]+"' | grep -Eo '[0-9]+' | head -n1)

if [ -z "$FB_PHOTO_ID" ]; then
  echo "[$(date)] ❌ Error FB CDN: $FB_PHOTO_RES" >> "$LOGFILE"
  exit 1
fi

PHOTO_DATA=$(curl -s "https://graph.facebook.com/v19.0/$FB_PHOTO_ID?fields=images&access_token=$PAGE_TOKEN")
IMAGE_URL=$(echo "$PHOTO_DATA" | grep -o '"source":"[^"]*' | head -n 1 | cut -d'"' -f4 | sed 's/\\//g')

IG_CONT_RES=$(curl -s -X POST -F "image_url=$IMAGE_URL" --form-string "caption=$COPY" -F "access_token=$PAGE_TOKEN" "https://graph.facebook.com/v19.0/$IG_ID/media")
IG_CONT_ID=$(echo "$IG_CONT_RES" | grep -Eo '"id":\s*"[0-9]+"' | grep -Eo '[0-9]+' | head -n1)

if [ -n "$IG_CONT_ID" ]; then
  sleep 5
  IG_PUB_RES=$(curl -s -X POST -F "creation_id=$IG_CONT_ID" -F "access_token=$PAGE_TOKEN" "https://graph.facebook.com/v19.0/$IG_ID/media_publish")
  IG_PUB_ID=$(echo "$IG_PUB_RES" | grep -Eo '"id":\s*"[0-9]+"' | grep -Eo '[0-9]+' | head -n1)
  
  if [ -n "$IG_PUB_ID" ]; then
    echo "[$(date)] ✅ IG OK: $IG_PUB_ID" >> "$LOGFILE"
  else
    echo "[$(date)] ❌ Error IG Pub: $IG_PUB_RES" >> "$LOGFILE"
  fi
else
  echo "[$(date)] ❌ Error IG Cont: $IG_CONT_RES" >> "$LOGFILE"
fi

FB_PUB_RES=$(curl -s -X POST -F "access_token=$PAGE_TOKEN" --form-string "message=$COPY" -F "source=@$IMAGE_PATH" "https://graph.facebook.com/v19.0/$PAGE_ID/photos")
FB_PUB_ID=$(echo "$FB_PUB_RES" | grep -Eo '"id":\s*"[0-9]+"' | grep -Eo '[0-9]+' | head -n1)

if [ -n "$FB_PUB_ID" ]; then
  echo "[$(date)] ✅ FB OK: $FB_PUB_ID" >> "$LOGFILE"
else
  echo "[$(date)] ❌ Error FB Pub: $FB_PUB_RES" >> "$LOGFILE"
fi

