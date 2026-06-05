const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const config = require('./.config.json');
const GROUPS = config.FB_GROUPS || [];
const PROFILE_DIR = config.FB_PROFILE_DIR || path.join(__dirname, '.fb-profile');

const FB_URL = 'https://www.facebook.com';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function postToGroup(page, groupId, message, imagePath) {
  console.log(`  Navegando a grupo ${groupId}...`);

  try {
    await page.goto(`${FB_URL}/groups/${groupId}`, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch {
    console.log(`  Timeout al cargar grupo ${groupId}, continuando...`);
  }
  await sleep(5000);

  const blocked = await page.evaluate(() => {
    const t = document.body.innerText;
    return t.includes('nete al grupo') || t.includes('Join group');
  });

  if (blocked) {
    console.log(`  No eres miembro del grupo ${groupId}`);
    return false;
  }

  // 1. Click the composer to open the post editor
  await page.evaluate(() => {
    const spans = document.querySelectorAll('span');
    for (const s of spans) {
      if (s.innerText.includes('Escribe algo') || s.innerText.includes('Write something')) {
        s.click();
        return;
      }
    }
  });
  await sleep(3000);

  // 2. Upload image (try all file inputs)
  if (imagePath && fs.existsSync(imagePath)) {
    const inputs = await page.$$('input[type="file"]');
    let uploaded = false;
    // Try each file input until one works
    for (const inp of inputs) {
      try {
        await inp.uploadFile(imagePath);
        uploaded = true;
        break;
      } catch {}
    }
    if (uploaded) {
      console.log('  Imagen cargada');
      await sleep(5000);
    } else {
      console.log('  No se pudo cargar imagen');
    }
  }

  // 3. Type message via keyboard
  await page.keyboard.type(message, { delay: 10 });
  console.log('  Mensaje escrito');
  await sleep(2000);

  // 4. Click Publicar
  const posted = await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Publicar"]');
    if (btn && btn.getAttribute('aria-disabled') !== 'true') {
      btn.click();
      return true;
    }
    return false;
  });

  if (posted) {
    console.log('  Publicando...');
    await sleep(5000);
    console.log('  Publicado!');
    return true;
  }

  console.log('  Boton Publicar deshabilitado');
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) {
    console.log(`
Uso: node post-to-groups.js <mensaje> [imagen]

Publica en grupos de Facebook via Puppeteer.
Primera ejecucion: login manual.
Siguientes: automatico headless.

Ejemplo:
  node post-to-groups.js "Texto" "assets/IMAGENES/chilaquiles.png"
    `);
    process.exit(0);
  }

  const message = args[0];
  const imagePath = args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : null;

  if (!GROUPS.length) {
    console.log('No hay grupos (FB_GROUPS en .config.json)');
    process.exit(0);
  }

  const firstRun = !fs.existsSync(PROFILE_DIR);

  const browser = await puppeteer.launch({
    headless: firstRun ? false : 'headless',
    userDataDir: PROFILE_DIR,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    protocolTimeout: 60000
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(45000);
    await page.setDefaultTimeout(30000);
    await page.setViewport({ width: 1400, height: 900 });

    if (firstRun) {
      await page.goto(`${FB_URL}/login`, { waitUntil: 'networkidle2', timeout: 60000 });
      console.log('Login manual...');
      await new Promise(resolve => {
        const check = setInterval(() => {
          page.url().includes('login') || (clearInterval(check), resolve());
        }, 1000);
      });
      console.log('Sesion guardada');
    } else {
      await page.goto(FB_URL, { waitUntil: 'networkidle2', timeout: 60000 });
      const ok = await page.evaluate(() => !document.body.innerText.includes('Inicia sesion'));
      if (!ok) {
        console.log('Sesion expirada. Borra .fb-profile y re-ejecuta');
        process.exit(1);
      }
      console.log('Sesion valida');
    }

    for (const gid of GROUPS) {
      let groupPage = page;
      try {
        // Use a fresh page/tab for each group
        if (GROUPS.indexOf(gid) > 0) {
          groupPage = await browser.newPage();
          await groupPage.setViewport({ width: 1400, height: 900 });
        }
        await postToGroup(groupPage, gid, message, imagePath);
      } catch (e) {
        console.log(`  Error en grupo ${gid}: ${e.message.substring(0, 80)}`);
      }
      // Close tab if not the first one
      if (gid !== GROUPS[0]) {
        await groupPage.close().catch(() => {});
      }
      await sleep(2000);
    }

    console.log('Publicacion en grupos completada');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
