const fs = require('fs');
const path = require('path');

const srcDir = '/Users/macbook/Proyectos/08-chilaquiles-aristeus';
const destDir = path.join(srcDir, 'public');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

function sanitize(p) {
    let s = p.trim().replace(/ /g, '_')
             .replace('fotos_de_productos_/', '')
             .replace('fotos_de_productos%20/', '')
             .replace('IMAGENES/', '');
    if (s.includes('plantilla')) return 'plantilla_v2.png';
    return s;
}

// List of all possible source locations
const folders = ['', 'fotos de productos ', 'IMAGENES'];

// Get all files from these locations
let allFiles = [];
folders.forEach(f => {
    const p = path.join(srcDir, f);
    if (fs.existsSync(p) && fs.lstatSync(p).isDirectory()) {
        const files = fs.readdirSync(p);
        files.forEach(file => {
            allFiles.push({
                name: file,
                fullPath: path.join(p, file),
                relPath: path.join(f, file)
            });
        });
    }
});

// Copy and rename
allFiles.forEach(f => {
    if (fs.lstatSync(f.fullPath).isFile()) {
        const newName = sanitize(f.relPath);
        const destPath = path.join(destDir, newName);
        fs.copyFileSync(f.fullPath, destPath);
        console.log(`Copied: ${f.relPath} -> ${newName}`);
    }
});

console.log('Assets copied to public/');
