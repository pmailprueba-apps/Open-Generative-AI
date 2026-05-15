/**
 * Antigravity Universal Capture Tool v2.0 - PRO
 * High-fidelity HTML to Image capture optimized for Safari.
 * Uses html-to-image (SVG foreignObject) for perfect color and text rendering.
 */

(function() {
    // 1. Configuración y Parámetros
    const currentScript = document.currentScript;
    const themeColor = currentScript.getAttribute('data-theme') || '#D4AF37';
    const targetId = currentScript.getAttribute('data-target') || '#captureArea';
    const fileName = currentScript.getAttribute('data-filename') || 'captura_hd.png';

    // Set CSS variable for the theme
    document.documentElement.style.setProperty('--theme-color', themeColor);
    console.log(`🚀 Universal Capture Tool PRO Initialized: Target=${targetId}`);

    // 2. Inyectar CSS Dinámicamente
    const scriptPath = currentScript.src;
    const baseDir = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${baseDir}/universal-capture.css`; 
    document.head.appendChild(link);

    // Estilos de emergencia inyectados para asegurar el Modal
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        #previewContainer {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.9) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 999999 !important;
            backdrop-filter: blur(10px);
        }
        .preview-card {
            background: #111 !important;
            padding: 30px !important;
            border-radius: 20px !important;
            border: 2px solid ${themeColor} !important;
            max-width: 90% !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            color: white !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8) !important;
        }
        .preview-img {
            max-width: 100% !important;
            border-radius: 10px !important;
            margin: 20px 0 !important;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5) !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // 3. Cargar Motores (Dual Engine: Pro + Compatibility)
    const loadScript = (src) => new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = resolve; // Continuar aunque uno falle
        document.head.appendChild(script);
    });

    if (typeof htmlToImage === 'undefined' || typeof html2canvas === 'undefined') {
        Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
        ]).then(initCaptureTool);
    } else {
        initCaptureTool();
    }

    function initCaptureTool() {
        // ... (resto del setup del botón)
        // Crear contenedor de controles si no existe
        let controls = document.querySelector('.capture-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'capture-controls';
            document.body.appendChild(controls);
        }

        const btn = document.createElement('button');
        btn.className = 'btn-capture';
        btn.innerHTML = `<span>📸 Capturar Imagen HD (Pro)</span>`;
        controls.appendChild(btn);

        btn.addEventListener('click', async () => {
            const originalText = btn.innerHTML;
            btn.innerHTML = "⌛ Generando Foto Pro...";
            btn.disabled = true;

            const captureArea = document.querySelector(targetId);
            if (!captureArea) {
                alert(`Error: No se encontró "${targetId}"`);
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            // Ocultar botones de edición
            const elementsToHide = document.querySelectorAll('.capture-controls, .edit-bar, .index-ref, #previewContainer');
            elementsToHide.forEach(el => el.style.opacity = '0');

            // 3. Pequeño retraso para que Safari procese el cambio de opacidad
            await new Promise(r => setTimeout(r, 500));

            // 4. Esperar a que las imágenes estén listas
            const images = captureArea.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(r => { img.onload = r; img.onerror = r; });
            }));

            // 5. Pequeño retraso para que el DOM se asiente
            await new Promise(r => setTimeout(r, 500));

            try {
                const config = {
                    quality: 0.95,
                    pixelRatio: 1.5,
                    backgroundColor: null,
                    skipFonts: true,
                    fontEmbedCSS: '',
                    style: {
                        transform: 'none',
                        filter: 'none'
                    }
                };

                let imgData = await htmlToImage.toPng(captureArea, config);
                
                // Si la imagen sale vacía o muy pequeña, reintentamos (Bug típico de Safari)
                if (imgData.length < 5000) {
                    btn.innerHTML = "⌛ Reintentando (Safari)...";
                    await new Promise(r => setTimeout(r, 1000));
                    imgData = await htmlToImage.toPng(captureArea, config);
                }

                // Restaurar visibilidad
                elementsToHide.forEach(el => el.style.opacity = '1');

                // Mostrar Preview
                let previewContainer = document.getElementById('previewContainer');
                if (!previewContainer) {
                    previewContainer = document.createElement('div');
                    previewContainer.id = 'previewContainer';
                    document.body.appendChild(previewContainer);
                }

                previewContainer.innerHTML = `
                    <div class="preview-card">
                        <h3 class="preview-title" style="color: #4CAF50;">🚀 Imagen Generada (Safari Pro)</h3>
                        <p class="preview-instructions">Si la imagen se ve bien, usa el botón de abajo:</p>
                        <img src="${imgData}" class="preview-img" style="border: 3px solid #4CAF50; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                        <div style="margin-top: 15px;">
                            <a href="${imgData}" download="${fileName}" class="btn-capture" style="display:inline-block; text-decoration:none; padding: 10px 20px; background: #4CAF50; color: white;">💾 Guardar Imagen</a>
                            <button class="btn-close-preview" style="margin-left: 10px;" onclick="this.parentElement.parentElement.parentElement.remove()">Cerrar</button>
                        </div>
                    </div>
                `;

                // Descarga automática
                const link = document.createElement('a');
                link.href = imgData;
                link.download = fileName;
                link.click();

                btn.innerHTML = originalText;
                btn.disabled = false;
                previewContainer.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.warn("Motor Pro falló, usando Motor de Compatibilidad (html2canvas)...", error);
                try {
                    btn.innerHTML = "⌛ Usando Motor de Respaldo...";
                    const canvas = await html2canvas(captureArea, {
                        scale: 2, // Calidad HD
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#050505', // Forzar fondo oscuro
                        logging: false
                    });
                    
                    const imgData = canvas.toDataURL("image/png");
                    
                    // Mostrar Preview (mismo código que arriba)
                    mostrarPreview(imgData);

                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    elementsToHide.forEach(el => el.style.opacity = '1');

                } catch (fallbackError) {
                    console.error("Error crítico en ambos motores:", fallbackError);
                    alert(`Error Fatal:\nNo se pudo generar la imagen con ningún motor.\n\n${fallbackError.message}`);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    elementsToHide.forEach(el => el.style.opacity = '1');
                }
            }
        });
    }

    function mostrarPreview(imgData) {
        let previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'previewContainer';
            document.body.appendChild(previewContainer);
        }

        previewContainer.innerHTML = `
            <div class="preview-card">
                <h3 class="preview-title" style="color: #D4AF37;">📸 Imagen Generada (Modo Respaldo)</h3>
                <p class="preview-instructions">La imagen se generó con el motor de compatibilidad:</p>
                <img src="${imgData}" class="preview-img" style="border: 3px solid #D4AF37; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="margin-top: 15px;">
                    <a href="${imgData}" download="${fileName}" class="btn-capture" style="display:inline-block; text-decoration:none; padding: 10px 20px; background: #D4AF37; color: white;">💾 Guardar Imagen</a>
                    <button class="btn-close-preview" style="margin-left: 10px;" onclick="this.parentElement.parentElement.parentElement.remove()">Cerrar</button>
                </div>
            </div>
        `;
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    }
})();
