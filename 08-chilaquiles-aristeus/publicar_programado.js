const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const calendario = JSON.parse(fs.readFileSync('./calendario.json'))
const ahora = new Date()
const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`

const idxHora = calendario.horarios.findIndex(h => {
  const [hh, mm] = h.split(':').map(Number)
  const [ah, am] = horaActual.split(':').map(Number)
  return ah === hh && am >= mm - 10 && am <= mm + 10
})
if (idxHora === -1) {
  console.log(`⏰ Sin publicación para las ${horaActual}`)
  process.exit(0)
}

const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const hoy = dias[ahora.getDay()]
const carpeta = `./contenido/${hoy}`

if (!fs.existsSync(carpeta)) {
  console.log(`📁 Carpeta ${carpeta} no existe`)
  process.exit(0)
}

const archivos = fs.readdirSync(carpeta)
  .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
  .sort()

if (archivos.length === 0) {
  console.log(`📁 ${carpeta} — sin imágenes`)
  process.exit(0)
}

const idxImg = Math.min(idxHora, archivos.length - 1)
const imgPath = path.join(carpeta, archivos[idxImg])
const post = calendario.dias[hoy]?.[idxHora]
const copy = post?.copy || `🍽️ ${hoy} de Aristëus — Ruta 57`

console.log(`📅 ${hoy} ${calendario.horarios[idxHora]}`)
const cmd = `node post.js "${copy.replace(/"/g, '\\"')}" "${imgPath}"`
execSync(cmd, { stdio: 'inherit' })

// Publicar en grupos de Facebook via Puppeteer
const groupsCmd = `node post-to-groups.js "${copy.replace(/"/g, '\\"')}" "${imgPath}"`
try {
  execSync(groupsCmd, { stdio: 'inherit', timeout: 120000 })
} catch (e) {
  console.log('⚠️ Grupos:', e.message.substring(0, 100))
}
