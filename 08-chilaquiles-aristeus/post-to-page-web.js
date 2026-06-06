const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const config = require('./.config.json');
const PROFILE_DIR = config.FB_PROFILE_DIR || path.join(__dirname, '.fb-profile');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const message = process.argv[2] || "Prueba";
  const imagePath = process.argv[3] ? path.resolve(process.argv[3]) : null;

  console.log('Abriendo Facebook...');
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: PROFILE_DIR,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1200,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });

    console.log('Navegando a la página de Facebook...');
    await page.goto('https://www.facebook.com/AristeusChilaquiles', { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(5000);

    // Revisar si estamos en login
    if (page.url().includes('login') || (await page.$('input[name="email"]'))) {
      console.log('Requiere login. Por favor hazlo manualmente en la ventana.');
      await new Promise(r => setTimeout(r, 20000));
      await page.goto('https://www.facebook.com/AristeusChilaquiles', { waitUntil: 'networkidle2' });
      await sleep(5000);
    }

    console.log('Intentando hacer clic en la caja de "Escribe algo..." o "Crear publicación"...');
    const clicked = await page.evaluate(() => {
      // Buscar elementos típicos
      const spans = document.querySelectorAll('span');
      for (const s of spans) {
        const text = s.innerText.toLowerCase();
        if (text.includes('escribe algo') || text.includes("what's on your mind") || text.includes('crear publicación')) {
          s.click();
          return true;
        }
      }
      return false;
    });

    if (clicked) {
      console.log('¡Caja de publicación abierta!');
      await sleep(3000);
    } else {
      console.log('No encontré el botón. Por favor dale clic tú en la pantalla al botón de crear publicación.');
      await sleep(5000);
    }

    // Subir imagen (buscar el input oculto)
    if (imagePath && fs.existsSync(imagePath)) {
      console.log('Buscando dónde subir la imagen...');
      const inputs = await page.$$('input[type="file"]');
      let uploaded = false;
      for (const inp of inputs) {
        try {
          await inp.uploadFile(imagePath);
          uploaded = true;
          break;
        } catch {}
      }
      if (uploaded) {
        console.log('¡Imagen adjuntada al post!');
        await sleep(5000);
      } else {
        console.log('No se pudo adjuntar automáticamente, por favor arrastra la foto a la ventana.');
        console.log('Ruta de la foto:', imagePath);
      }
    }

    // Escribir texto
    console.log('Escribiendo texto...');
    await page.keyboard.type(message, { delay: 10 });
    await sleep(2000);

    // Clic en Publicar
    console.log('Buscando botón Publicar...');
    const posted = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label="Publicar"]');
      if (btn && btn.getAttribute('aria-disabled') !== 'true') {
        btn.click();
        return true;
      }
      // También buscar span que diga Publicar
      const spans = document.querySelectorAll('span');
      for (const s of spans) {
        if (s.innerText === 'Publicar' || s.innerText === 'Post') {
          s.click();
          return true;
        }
      }
      return false;
    });

    if (posted) {
      console.log('¡Botón Publicar presionado!');
    } else {
      console.log('Por favor, presiona el botón Publicar tú mismo en la pantalla.');
    }

    console.log('\nEsperando 2 minutos para que confirmes que se subió o arregles cualquier error...');
    await sleep(120000); // 2 minutos

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
