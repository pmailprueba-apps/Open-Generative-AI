const sharp = require('sharp');
const path = require('path');

const fs = require('fs');

const inputPath = '/Users/macbook/Proyectos/obsidean proyectos/13-convertidor-de-html/menu-chilaquiles-v1.png';
const outputDir = '/Users/macbook/Proyectos/obsidean proyectos/13-convertidor-de-html';

async function splitImage() {
  const metadata = await sharp(inputPath).metadata();
  const { width, height } = metadata;

  console.log(`Imagen original: ${width} x ${height} píxeles`);

  const halfHeight = Math.floor(height / 2);
  const overlap = 100;

  // EJEMPLO 1: División exacta 50/50
  console.log('\n--- EJEMPLO 1: División exacta 50/50 ---');
  await sharp(inputPath)
    .extract({ left: 0, top: 0, width, height: halfHeight })
    .toFile(path.join(outputDir, 'ejemplo-1-pagina1-50-50.png'));
  console.log('Página 1 creada: ejemplo-1-pagina1-50-50.png');

  await sharp(inputPath)
    .extract({ left: 0, top: halfHeight, width, height: height - halfHeight })
    .toFile(path.join(outputDir, 'ejemplo-1-pagina2-50-50.png'));
  console.log('Página 2 creada: ejemplo-1-pagina2-50-50.png');

  // EJEMPLO 2: Centrar contenido en ambas mitades
  console.log('\n--- EJEMPLO 2: Con contenido centrado ---');
  // Crear canvas blanco del mismo tamaño y centrar la imagen recortada
  const pageHeight = halfHeight;

  // Página 1: mitad superior centrada en canvas
  await sharp(inputPath)
    .extract({ left: 0, top: 0, width, height: pageHeight })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // --deep-navy color
    })
    .toFile(path.join(outputDir, 'ejemplo-2-pagina1-centrado.png'));
  console.log('Página 1 creada: ejemplo-2-pagina1-centrado.png');

  // Página 2: mitad inferior con overlap, también centrada
  const page2Height = height - halfHeight + overlap;
  await sharp(inputPath)
    .extract({ left: 0, top: halfHeight - overlap, width, height: page2Height })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    })
    .toFile(path.join(outputDir, 'ejemplo-2-pagina2-centrado.png'));
  console.log('Página 2 creada: ejemplo-2-pagina2-centrado.png');

  // EJEMPLO 3: Página 2 con margen superior
  console.log('\n--- EJEMPLO 3: Página 2 con margen de 200px ---');
  const margin = 200;
  await sharp(inputPath)
    .extract({ left: 0, top: 0, width, height: halfHeight - margin })
    .toFile(path.join(outputDir, 'ejemplo-3-pagina1-margen.png'));
  console.log('Página 1 creada: ejemplo-3-pagina1-margen.png');

  await sharp(inputPath)
    .extract({ left: 0, top: halfHeight - margin, width, height: height - halfHeight + margin })
    .toFile(path.join(outputDir, 'ejemplo-3-pagina2-margen.png'));
  console.log('Página 2 creada: ejemplo-3-pagina2-margen.png');

  console.log('\n✅ ¡Listo!');
}

splitImage().catch(console.error);
