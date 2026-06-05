const { execSync } = require('child_process')

const semana = [
  {
    dia: 'Lunes',
    copy: '¿Verdes o rojos? La pregunta más importante de tu mañana 💚❤️\n\nEn Aristëus no tienes que elegir mal. Ambos son artesanales, con totopo crujiente y salsa de la casa.\n\n📍 Calle 2a #185, Col. Aviación (El Lavadero SLP)\n🚗 Pide por UberEats\n📲 O escríbenos por WhatsApp',
    img: 'assets/IMAGENES/chilaquiles_verdes.png'
  },
  {
    dia: 'Martes',
    copy: '🔥 El Despertar de Aristëus — Salsa roja de chorizo (Salsa Imperial), totopos, queso menonita, crema de rancho.\n\nEl desayuno que despierta hasta al más dormido.\n\n📍 Calle 2a #185, Col. Aviación\n🚗 UberEats activo',
    img: 'assets/fotos de productos /chilaquiles_rojos.png'
  },
  {
    dia: 'Miércoles',
    copy: 'Detrás de cada totopo crujiente hay una historia de calidad.\n\nEn Aristëus no cortamos esquinas. Cada ingrediente es seleccionado para darte la mejor experiencia.\n\n📍 El Lavadero SLP\n📲 Pide al 55 6148 5296',
    img: 'assets/fotos de productos /chilaquiles con pollo .png'
  },
  {
    dia: 'Jueves',
    copy: '¿Con qué proteína te quedas? 🤔\n\n🔸 Pollo\n🔸 Huevo\n🔸 Arrachera\n🔸 Camarón\n\nTodos disponibles en nuestros chilaquiles de autor.\n\n📍 Calle 2a #185, Col. Aviación',
    img: 'assets/fotos de productos /chilaquiles con huevo estrallado .png'
  },
  {
    dia: 'Viernes',
    copy: '¡Viernes de Premio! 🏆\n\nEl Banquete del Patrón: Chilaquiles con Arrachera premium marinada y asada a las brasas.\n\n$130 precio local / $162.50 delivery\n\nPide por UberEats o mándanos WhatsApp.',
    img: 'assets/IMAGENES/chilaquiles_rojos.png'
  },
  {
    dia: 'Sábado',
    copy: 'Sábado de antojo… ¿te traemos unos chilaquiles? 🏎️\n\nAbiertos de 8am a 3pm. Llegamos hasta tu casa.\n\n📍 Calle 2a #185, Col. Aviación\n🚗 UberEats / WhatsApp',
    img: 'assets/fotos de productos /chilakiles con camaron .png'
  },
  {
    dia: 'Domingo',
    copy: 'Domingo de chilaquiles, domingo de Aristëus 💛\n\nHoy descansamos, pero el antojo no. Pide delivery y te llevamos la Ruta 57 hasta tu mesa.\n\n🚗 UberEats activo\n📲 55 6148 5296',
    img: 'assets/IMAGENES/chilaquiles_dulces.png'
  }
]

const args = process.argv.slice(2)
const soloHoy = args[0] === 'hoy'
const soloFacebook = args.includes('--fb-only')
const soloInstagram = args.includes('--ig-only')
const mostrar = args[0] === 'mostrar' || args[0] === 'preview'

if (mostrar || (!soloHoy && args.length === 0)) {
  semana.forEach((post, i) => {
    console.log(`\n📅 Día ${i + 1} (${post.dia}):`)
    console.log(`   Copy: ${post.copy.slice(0, 50)}...`)
    console.log(`   Imagen: ${post.img}`)
  })
  console.log(`\nComandos:`)
  console.log(`  node semana.js hoy           → Publica HOY en Facebook + Instagram`)
  console.log(`  node semana.js hoy --fb-only → Solo Facebook`)
  console.log(`  node semana.js hoy --ig-only → Solo Instagram`)
  process.exit(0)
}

if (soloHoy) {
  const hoy = new Date().getDay()
  const diasMap = [6, 0, 1, 2, 3, 4, 5]
  const idx = diasMap[hoy]
  const post = semana[idx]
  if (!post) { console.log('Hoy no hay post'); process.exit(0) }

  console.log(`\n📅 Publicando: ${post.dia}`)

  let flags = ''
  if (soloFacebook) flags = ' --fb-only'
  else if (soloInstagram) flags = ' --ig-only'

  const cmd = `node post.js "${post.copy}" "${post.img}"${flags}`
  console.log(`> ${cmd}\n`)
  execSync(cmd, { stdio: 'inherit' })
}
