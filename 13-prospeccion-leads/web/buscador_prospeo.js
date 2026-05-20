const https = require('https');
const fs = require('fs');

// CONFIGURACIÓN
const API_KEY = "pk_7dcdad3cfe02f6c725edc32e4358c454837cf9445dee5a91b656e178fa57b0a9";
const DOMAINS = [
    "bmw.com.mx", "nestle.com.mx", "kelloggs.com.mx", 
    "pepsico.com.mx", "kimberly-clark.com.mx", "ternium.com",
    "cmoctezuma.com.mx", "grupogondi.com", "calidra.com",
    "gm.com.mx", "mabe.com.mx", "draexlmaier.com", "bosch.com",
    "continental.com", "daikin.com.mx", "lear.com", "maxionwheels.com",
    "faurecia.com", "valeo.com", "metalsa.com", "cummins.com",
    "logisticsplus.com", "alplogistics.com.mx", "craneww.com", "ramconlogistics.com"
];

function prospeoRequest(path, data) {
    const postData = JSON.stringify(data);
    const options = {
        hostname: 'api.prospeo.io',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-KEY': API_KEY,
            'Content-Length': postData.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function main() {
    const allLeads = [];
    console.log("Iniciando búsqueda de prospectos en México (Node.js)...");

    for (const domain of DOMAINS) {
        console.log(`Procesando: ${domain}...`);
        try {
            const searchRes = await prospeoRequest('/search-person', {
                page: 1,
                filters: {
                    company: { websites: { include: [domain] } },
                    person_location_search: { include: ["Mexico"] }
                }
            });

            const results = searchRes.response?.results || [];
            console.log(`  Encontrados ${results.length} resultados totales para ${domain}`);
            const keywords = ["Gerente", "Manager", "Director", "Logistica", "Compras", "Operations", "Purchasing", "Supply Chain", "Plant", "Logistics", "Operations"];

            // Tomar los primeros 3 para ahorrar créditos y tiempo en esta prueba
            for (const p of results.slice(0, 3)) {
                const title = p.job_title || '';
                if (keywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()))) {
                    console.log(`  Revelando email para: ${p.full_name}...`);
                    const enriched = await prospeoRequest('/enrich-person', { person_id: p.person_id });
                    const email = enriched.response?.email?.email || 'No encontrado';

                    allLeads.push({
                        Nombre: p.full_name,
                        Puesto: title,
                        Empresa: domain,
                        Email: email
                    });
                    // Pequeño delay para respetar limites
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        } catch (err) {
            console.error(`Error procesando ${domain}:`, err.message);
        }
    }

    // Guardar en CSV
    const csvContent = "Nombre,Puesto,Empresa,Email\n" + 
        allLeads.map(l => `"${l.Nombre}","${l.Puesto}","${l.Empresa}","${l.Email}"`).join("\n");
    
    fs.writeFileSync('prospectos_verificados.csv', csvContent);
    console.log("\n¡Listo! Archivo 'prospectos_verificados.csv' generado con éxito.");
}

main().catch(console.error);
