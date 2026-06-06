const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = path.join(__dirname, '.tiktok-profile');
const TIKTOK_UPLOAD_URL = 'https://www.tiktok.com/tiktokstudio/upload';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length < 2) {
    console.log(`
Uso: node upload-tiktok.js <ruta_del_video> "<texto_del_post_incluyendo_hashtags>"

Publica videos en TikTok usando Puppeteer.
Primera ejecución: Se abrirá el navegador para que inicies sesión manualmente.
Siguientes ejecuciones: Se hará automáticamente.

Ejemplo:
  node upload-tiktok.js "videos/promo1.mp4" "Prueba de chilaquiles #food #slp"
    `);
    process.exit(0);
  }

  const videoPath = path.resolve(args[0]);
  const caption = args[1];

  if (!fs.existsSync(videoPath)) {
    console.error(`Error: No se encontró el video en ${videoPath}`);
    process.exit(1);
  }

  const firstRun = !fs.existsSync(PROFILE_DIR);
  console.log(firstRun ? 'Iniciando por primera vez (Login manual requerido)...' : 'Iniciando bot...');

  const browser = await puppeteer.launch({
    headless: firstRun ? false : false, // TikTok a veces bloquea headless, lo dejamos visible por seguridad (o cambia a "new" si prefieres oculto)
    userDataDir: PROFILE_DIR,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,960']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });

    if (firstRun) {
      console.log('Navegando a TikTok para inicio de sesión...');
      await page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
      console.log('Por favor, inicia sesión en la ventana del navegador.');
      console.log('Esperando a que completes el inicio de sesión... (Puedes ver la URL cambiar a la página principal)');
      
      // Esperar hasta que el usuario haya iniciado sesión (redirección a fyp o cuenta)
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (!page.url().includes('/login')) {
            clearInterval(check);
            resolve();
          }
        }, 2000);
      });
      console.log('Sesión detectada. Guardando cookies...');
      await sleep(5000); // Esperar que cargue bien
    }

    console.log('Navegando al centro de carga de creadores...');
    await page.goto(TIKTOK_UPLOAD_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(8000); // Esperar a que cargue el iframe o interfaz (TikTok es pesado)

    // Si nos redirigió al login aunque haya perfil (sesión vencida o incompleta)
    if (page.url().includes('/login')) {
      console.log('La sesión parece haber expirado o no se completó. Por favor, inicia sesión de nuevo en la ventana...');
      await new Promise(resolve => {
        const check = setInterval(() => {
          if (!page.url().includes('/login')) {
            clearInterval(check);
            resolve();
          }
        }, 2000);
      });
      console.log('Nueva sesión detectada. Guardando cookies y recargando centro de carga...');
      await sleep(5000);
      await page.goto(TIKTOK_UPLOAD_URL, { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(8000);
    }

    // Manejar posible iframe de upload o buscar en todos los frames
    let fileInput = null;
    let targetFrame = page;
    
    // Primero intentamos en el frame principal o frames conocidos
    for (const f of page.frames()) {
      try {
        const input = await f.$('input[type="file"][accept*="video"]');
        if (input) {
          fileInput = input;
          targetFrame = f;
          break;
        }
      } catch (e) {
        // Ignorar errores de acceso a frames
      }
    }

    if (!fileInput) {
      // Intento más genérico
      for (const f of page.frames()) {
        try {
          const input = await f.$('input[type="file"]');
          if (input) {
            fileInput = input;
            targetFrame = f;
            break;
          }
        } catch (e) {
          // Ignorar
        }
      }
    }

    if (!fileInput) {
      console.error('No se pudo encontrar el botón de subir video. TikTok podría haber cambiado su interfaz o tu sesión caducó.');
      process.exit(1);
    }

    // Reasignamos uploadFrame al frame donde encontramos el input
    const uploadFrame = targetFrame;

    console.log(`Cargando video: ${videoPath}`);
    await fileInput.uploadFile(videoPath);
    console.log('Video cargado en el navegador, esperando que se procese...');
    
    // Esperar a que cambie la UI y aparezca el editor de texto
    await sleep(15000); // Dar tiempo generoso a la carga local

    console.log('Escribiendo la descripción (caption)...');
    // En TikTok el editor suele ser .DraftEditor-root o [contenteditable="true"]
    // Vamos a buscar el contenteditable e interactuar con él
    const editorSelector = '[contenteditable="true"], .DraftEditor-root';
    try {
      await uploadFrame.waitForSelector(editorSelector, { timeout: 15000 });
      
      // Limpiamos contenido por defecto si lo hay (a veces pone el nombre del archivo)
      await uploadFrame.click(editorSelector);
      
      // Escribir el caption
      // En TikTok para los hashtags es mejor escribirlos y dar espacio
      await uploadFrame.keyboard.type(caption, { delay: 50 });
      console.log('Descripción escrita correctamente.');
    } catch (e) {
      console.log('No se pudo escribir la descripción automáticamente. Puedes hacerlo manual antes de que se envíe.');
    }

    console.log('Esperando a que se active el botón de Publicar...');
    // El botón de Publicar usualmente tiene un texto como "Post" o "Publicar"
    // Buscamos botones en la pantalla
    let postClicked = false;
    // Hacemos polling del botón hasta que deje de estar deshabilitado
    for (let i = 0; i < 30; i++) { // Hasta 60 segundos
      const clicked = await uploadFrame.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const postBtn = btns.find(b => b.innerText.includes('Publicar') || b.innerText.includes('Post'));
        
        if (postBtn && !postBtn.disabled && !postBtn.className.includes('disabled')) {
          postBtn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        console.log('¡Botón de Publicar presionado!');
        postClicked = true;
        break;
      }
      await sleep(2000);
      process.stdout.write('.');
    }
    console.log('');

    if (postClicked) {
      console.log('Esperando confirmación de subida...');
      await sleep(10000); // Esperar que pase la animación de subido
      console.log('✅ Proceso de publicación finalizado.');
    } else {
      console.error('❌ No se pudo presionar el botón de Publicar (quizás el video no terminó de procesarse o el botón cambió de nombre).');
    }

  } catch (error) {
    console.error('Error durante la ejecución:', error);
  } finally {
    console.log('Cerrando navegador...');
    await browser.close();
  }
}

main().catch(console.error);
