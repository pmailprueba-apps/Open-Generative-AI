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

  // 1. Upload image FIRST (before opening composer)
  if (imagePath && fs.existsSync(imagePath)) {
    const idx = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]');
      for (let i = inputs.length - 1; i >= 0; i--) {
        const accept = inputs[i].getAttribute('accept') || '';
        if (accept.includes('image/*')) return i;
      }
      return -1;
    });

    if (idx >= 0) {
      try {
        const ext = path.extname(imagePath).toLowerCase().replace('.', '');
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                     ext === 'png' ? 'image/png' : 'image/' + ext;
        const fileData = fs.readFileSync(imagePath);

        await page.evaluate(({ inputIdx, data, mimeType, fileName }) => {
          const inputs = document.querySelectorAll('input[type="file"]');
          const target = inputs[inputIdx];
          if (!target) return;

          const blob = new Blob([new Uint8Array(data)], { type: mimeType });
          const file = new File([blob], fileName, { type: mimeType });
          const dt = new DataTransfer();
          dt.items.add(file);
          target.files = dt.files;
          target.dispatchEvent(new Event('change', { bubbles: true }));
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }, { inputIdx: idx, data: [...fileData], mimeType: mime, fileName: path.basename(imagePath) });

        console.log('  Imagen cargada');
        await sleep(5000);
      } catch (e) {
        console.log('  Error imagen:', e.message.substring(0, 50));
      }
    }
  }

  // 2. Click the NEW POST composer (top of page, not comment boxes)
  await page.evaluate(() => {
    const divs = document.querySelectorAll('div[role="button"]');
    for (const d of divs) {
      const text = d.innerText || '';
      if (text.includes('Escribe algo') || text.includes('Write something')) {
        const parent = d.closest('[role="region"], [role="feed"], div[data-pagelet]');
        if (parent && (parent.innerText.includes('Foto/video') || parent.innerText.includes('Sentimiento/actividad'))) {
          d.click();
          return;
        }
      }
    }
    const spans = document.querySelectorAll('span');
    let topSpan = null;
    let topY = Infinity;
    for (const s of spans) {
      if (s.innerText.includes('Escribe algo') || s.innerText.includes('Write something')) {
        const rect = s.getBoundingClientRect();
        if (rect.top < topY) { topY = rect.top; topSpan = s; }
      }
    }
    if (topSpan) topSpan.click();
  });
  await sleep(4000);

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

    for (let gi = 0; gi < GROUPS.length; gi++) {
      const gid = GROUPS[gi];
      let groupPage = page;
      try {
        if (gi > 0) {
          groupPage = await browser.newPage();
          await groupPage.setViewport({ width: 1400, height: 900 });
        }
        await postToGroup(groupPage, gid, message, imagePath);
      } catch (e) {
        console.log(`  Error en grupo ${gid}: ${e.message.substring(0, 80)}`);
      }
      if (gi > 0) {
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
