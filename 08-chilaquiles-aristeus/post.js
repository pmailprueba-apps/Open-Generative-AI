const https = require('https')
const fs = require('fs')
const path = require('path')

const config = require('./.config.json')
const PAGE_ID = config.PAGE_ID
const PAGE_TOKEN = process.env.PAGE_TOKEN || config.PAGE_TOKEN
const IG_ID = config.IG_USER_ID

function graphPost(endpoint, data, isMultipart = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://graph.facebook.com/v19.0${endpoint}`)
    const options = { method: 'POST', headers: {} }

    if (isMultipart) {
      options.headers = data.headers
      const req = https.request(url, options, res => {
        let body = ''
        res.on('data', c => body += c)
        res.on('end', () => {
          try { resolve(JSON.parse(body)) }
          catch { resolve(body) }
        })
      })
      req.write(data.body)
      req.end()
    } else {
      const body = new URLSearchParams(data).toString()
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      options.headers['Content-Length'] = Buffer.byteLength(body)
      const req = https.request(url, options, res => {
        let body = ''
        res.on('data', c => body += c)
        res.on('end', () => {
          try { resolve(JSON.parse(body)) }
          catch { resolve(body) }
        })
      })
      req.write(body)
      req.end()
    }
  })
}

function graphGet(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`https://graph.facebook.com/v19.0${endpoint}`, res => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch { resolve(body) }
      })
    })
  })
}

function makeMultipart(fields, filePath) {
  const boundary = '----Boundary' + Math.random().toString(36).slice(2)
  const fileData = fs.readFileSync(filePath)
  const fileName = path.basename(filePath)

  let body = ''
  for (const [k, v] of Object.entries(fields)) {
    body += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`
  }
  body += `--${boundary}\r\nContent-Disposition: form-data; name="source"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`

  const buffer = Buffer.concat([
    Buffer.from(body),
    fileData,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ])

  return {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': buffer.length
    },
    body: buffer
  }
}

async function postToFacebook(imagePath, message) {
  const fullPath = path.resolve(imagePath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Archivo no encontrado: ${fullPath}`)
    process.exit(1)
  }
  console.log(`📸 Facebook — Subiendo foto...`)

  const multipart = makeMultipart({
    message,
    access_token: PAGE_TOKEN
  }, fullPath)

  const result = await graphPost(`/${PAGE_ID}/photos`, multipart, true)
  if (result.error) {
    console.error('❌ Error Facebook:', result.error.message)
    process.exit(1)
  }
  console.log(`✅ Facebook — Publicada! ID: ${result.id}`)
  return result
}

async function postText(message) {
  console.log('📝 Publicando texto en Facebook...')
  const result = await graphPost(`/${PAGE_ID}/feed`, {
    message,
    access_token: PAGE_TOKEN
  })
  if (result.error) {
    console.error('❌ Error Facebook:', result.error.message)
    process.exit(1)
  }
  console.log(`✅ Facebook — Publicado! ID: ${result.id}`)
  return result
}

async function postToGroups(imagePath, message) {
  const groups = config.FB_GROUPS || []
  if (!groups.length) {
    console.log('⚠️ Grupos: No hay grupos configurados (FB_GROUPS en .config.json)')
    return
  }

  const hasImage = imagePath && fs.existsSync(path.resolve(imagePath))

  for (const groupId of groups) {
    console.log(`📸 Grupos — Publicando en grupo ${groupId}...`)

    if (hasImage) {
      const fullPath = path.resolve(imagePath)
      const multipart = makeMultipart({
        message,
        access_token: PAGE_TOKEN
      }, fullPath)

      const result = await graphPost(`/${groupId}/photos`, multipart, true)
      if (result.error) {
        console.error(`  ❌ Error en grupo ${groupId}: ${result.error.message}`)
        continue
      }
      console.log(`  ✅ Publicado en grupo ${groupId}`)
    } else {
      const result = await graphPost(`/${groupId}/feed`, {
        message,
        access_token: PAGE_TOKEN
      })
      if (result.error) {
        console.error(`  ❌ Error en grupo ${groupId}: ${result.error.message}`)
        continue
      }
      console.log(`  ✅ Publicado en grupo ${groupId}`)
    }
  }
}

async function postToInstagram(imagePath, caption) {
  if (!IG_ID) {
    console.log('⚠️ Instagram: IG_USER_ID no configurado')
    return null
  }
  const fullPath = path.resolve(imagePath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Archivo no encontrado: ${fullPath}`)
    return null
  }
  console.log(`📸 Instagram — Subiendo foto a Facebook para obtener CDN...`)

  const multipart = makeMultipart({
    access_token: PAGE_TOKEN,
    published: 'false'
  }, fullPath)

  const fbPhoto = await graphPost(`/${PAGE_ID}/photos`, multipart, true)
  if (fbPhoto.error) {
    console.error('❌ Error al subir a Facebook (CDN):', fbPhoto.error.message)
    return null
  }

  console.log(`   Foto subida a Facebook, obteniendo URL...`)
  const photoData = await graphGet(`/${fbPhoto.id}?fields=images&access_token=${PAGE_TOKEN}`)
  const imageUrl = photoData?.images?.[0]?.source

  if (!imageUrl) {
    console.error('❌ No se pudo obtener URL de la imagen desde Facebook CDN')
    return null
  }
  console.log(`   URL CDN obtenida`)

  console.log(`   Creando contenedor en Instagram...`)
  const container = await graphPost(`/${IG_ID}/media`, {
    image_url: imageUrl,
    caption: caption,
    access_token: PAGE_TOKEN
  })
  if (container.error) {
    console.error('❌ Error Instagram (contenedor):', container.error.message)
    return null
  }
  console.log(`   Contenedor creado: ${container.id}`)

  console.log(`   Esperando 5 segundos...`)
  await new Promise(r => setTimeout(r, 5000))

  console.log(`   Publicando en Instagram...`)
  const result = await graphPost(`/${IG_ID}/media_publish`, {
    creation_id: container.id,
    access_token: PAGE_TOKEN
  })
  if (result.error) {
    console.error('❌ Error Instagram (publicar):', result.error.message)
    return null
  }
  console.log(`✅ Instagram — Publicada! ID: ${result.id}`)
  return result
}

async function main() {
  const args = process.argv.slice(2)
  const onlyInstagram = args.includes('--ig-only')
  const onlyFacebook = args.includes('--fb-only')
  const onlyGroups = args.includes('--groups-only')
  const alsoGroups = args.includes('--groups')
  const showHelp = args.includes('--help') || args.length === 0 || (args.length === 1 && args[0].startsWith('--'))

  if (showHelp) {
    console.log(`
Uso: node post.js <mensaje> [imagen] [flags]

Flags:
  --ig-only     Publicar SOLO en Instagram
  --fb-only     Publicar SOLO en Facebook
  --groups      También publicar en grupos configurados
  --groups-only Publicar SOLO en grupos

Ejemplos:
  node post.js "¿Verdes o rojos?"
  node post.js "Hoy oferta!" "assets/IMAGENES/chilaquiles_verdes.png"
  node post.js "Texto" "ruta/imagen.png" --groups
  node post.js "Texto" "ruta/imagen.png" --groups-only
    `)
    process.exit(0)
  }

  const message = args[0]
  const imagePath = args[1] && !args[1].startsWith('--') ? args[1] : null

  const doFacebook = !onlyInstagram && !onlyGroups
  const doInstagram = !onlyFacebook && !onlyGroups && !!imagePath
  const doGroups = alsoGroups || onlyGroups

  if (doFacebook) {
    if (imagePath) {
      const fbResult = await postToFacebook(imagePath, message)
      fs.writeFileSync('.resultado_api.json', JSON.stringify(fbResult))
    } else {
      const fbResult = await postText(message)
      fs.writeFileSync('.resultado_api.json', JSON.stringify(fbResult))
    }
  }

  if (doInstagram) {
    const igResult = await postToInstagram(imagePath, message)
    if (igResult) {
      fs.writeFileSync('.resultado_ig.json', JSON.stringify(igResult))
    }
  }

  if (doGroups) {
    await postToGroups(imagePath, message)
  }

  console.log(`\n🔗 https://facebook.com/AristeusChilaquiles`)
}

main().catch(console.error)
