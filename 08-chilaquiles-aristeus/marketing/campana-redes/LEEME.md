# Campana Redes - Chilaquiles Aristeus

## Estructura
```
campana-redes/
├── imagenes/       # Imagenes por dia (Lunes a Domingo)
│   ├── Lunes/      # 8 imagenes
│   ├── Martes/     # 8 imagenes
│   ├── Miercoles/  # 7 imagenes
│   ├── Jueves/     # 8 imagenes
│   ├── Viernes/    # 8 imagenes
│   ├── Sabado/     # 8 imagenes
│   └── Domingo/    # 7 imagenes
├── copies/          # Textos de publicacion
├── calendario.json  # Calendario con copies + horarios
├── post.js          # Publicador Meta Graph API
├── config.json      # Tokens y config
├── publicar_flyer.sh # Script de publicacion manual
└── LEEME.md
```

## Publicacion automatica
- Mac: 12:00 y 15:00 via launchd
- QNAP: 192.168.100.10 en /share/CACHEDEV1_DATA/aristeus-publisher/

## Para publicar manualmente
```bash
cd campana-redes
node post.js "Texto del post" "imagenes/Lunes/Gemini_Generated_Image_xxx.png"
```
