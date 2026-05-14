const fs = require('fs');
const path = require('path');

const filePath = '/Users/macbook/Proyectos/08-chilaquiles-aristeus/menu-aristeus-ultra-premium.html';
const outputPath = '/Users/macbook/Proyectos/08-chilaquiles-aristeus/public/index.html';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Image Path Fixes & Cache Busting
function sanitize(p) {
    let s = p.trim().replace(/ /g, '_')
             .replace('fotos_de_productos_/', '')
             .replace('fotos_de_productos%20/', '')
             .replace('IMAGENES/', '');
    if (s.includes('plantilla')) return 'plantilla_v2.png';
    return s;
}

content = content.replace(/src="([^"]*)"/g, (match, p1) => `src="${sanitize(p1)}"`);
content = content.replace(/url\(['"]?([^'"]*)['"]?\)/g, (match, p1) => `url('${sanitize(p1)}')`);

// 2. Remove all technical markers
content = content.replace(/<span class="(index-ref|img-index)"[\s\S]*?>[\s\S]*?<\/span>/g, '');
content = content.replace(/\[\d+(\.\d+)*\]/g, '');
content = content.replace(/\[F-\d+(\.\d+)*\]/g, '');

// 3. Remove Editing Interface
content = content.replace(/<div class="edit-bar">[\s\S]*?<\/div>/g, '');
content = content.replace(/contenteditable="true"/g, 'contenteditable="false"');

// 4. Convert Inputs to Spans
content = content.replace(/<input type="text" class="price-input" data-id="(.*?)">/g, '<span class="price-value" data-id="$1"></span>');

// 5. Update Script logic
content = content.replace(/i\.value = lista\[i\.dataset\.id\] \|\| ''/g, "i.textContent = lista[i.dataset.id] || ''");
content = content.replace(/document\.querySelectorAll\('\.price-input'\)/g, "document.querySelectorAll('.price-value')");

// 6. Mobile Responsiveness & Background Fix
const mobileStyles = `
        body {
            background-size: 100% auto !important;
            background-attachment: scroll !important;
            background-position: top center !important;
            background-repeat: repeat-y !important;
        }

        /* === MOBILE PRODUCTION OVERRIDES === */
        @media (max-width: 768px) {
            .hero {
                padding: 20px 10px 10px !important;
            }
            .hero-logo {
                width: 80% !important;
                max-width: 280px !important;
            }
            .subtitle-logo {
                width: 70% !important;
                max-width: 200px !important;
            }
            .hero h1 {
                font-size: 1.8rem !important;
            }
            .section-header h2 {
                font-size: 1.8rem !important;
            }
            .menu-grid {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }
            .item-img-container {
                height: 160px !important;
            }
            .footer-bg-logo {
                width: 200px !important;
            }
        }
        
        .price-value {
            font-family: 'Outfit', sans-serif;
            font-weight: 800;
            color: var(--harvest-gold);
            font-size: 1.4rem;
        }
    </style>`;

content = content.replace('</style>', mobileStyles);
content = content.replace('</body>', '<script>window.onload = () => { if(typeof mode === "function") mode("local"); };</script></body>');

fs.writeFileSync(outputPath, content);
console.log('Production index.html V3 GENERATED.');
