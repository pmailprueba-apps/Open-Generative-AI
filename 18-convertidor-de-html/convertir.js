const puppeteer = require('puppeteer');

const path = require('path');

const projectRoot = '/Users/macbook/Proyectos/08-chilaquiles-aristeus';
const htmlFile = 'menu-aristeus-ultra-premium-vf-2026.html';
const projectDir = path.join(projectRoot, 'web');
const assetsDir = path.join(projectRoot, 'assets');
const outputPath = '/Users/macbook/Proyectos/BACKUPS/2026-05-13-SYNC/menu-chilaquiles-v1-final.png';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.setViewport({
    width: 1200,
    height: 1600,
    deviceScaleFactor: 2
  });

  await page.addStyleTag({
    content: `
      .main-wrapper {
        background-image: url('file://${path.join(assetsDir, 'plantilla_vf.png')}') !important;
        background-repeat: repeat-y !important;
        background-size: 100% auto !important;
        background-position: top center !important;
        min-height: 100% !important;
      }
    `
  });

  const fileUrl = `file://${projectDir}/${htmlFile}`;
  console.log('Abriendo:', fileUrl);

  await page.goto(fileUrl, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  console.log('Esperando que carguen los recursos...');
  await new Promise(r => setTimeout(r, 5000));

  // Verificar imágenes rotas
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs
      .filter(img => !(img.complete && img.naturalHeight !== 0))
      .map(img => ({
        src: img.src,
        alt: img.alt
      }));
  });

  console.log('\n=== IMÁGENES ROTAS ===');
  brokenImages.forEach(img => {
    console.log(`- ${img.src} (${img.alt})`);
  });

  console.log(`\nTotal: ${brokenImages.length} imágenes rotas`);

  console.log('\nCapturando PNG...');
  await page.screenshot({
    path: outputPath,
    fullPage: true
  });

  await browser.close();
  console.log(`¡Listo!`);
})();
