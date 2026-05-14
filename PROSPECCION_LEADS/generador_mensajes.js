require('dotenv').config({ path: '../.env' });
const https = require('https');

const API_KEY = process.env.GOOGLE_API_KEY;

async function generarMensaje(nombre, puesto, empresa) {
    // Escapar el prompt para asegurar que no rompa el JSON
    const promptText = `
    Eres un consultor senior de ventas industriales B2B en México. 
    Escribe un correo electrónico formal y ejecutivo dirigido a ${nombre}, ${puesto} en ${empresa}.
    
    El objetivo es presentar a "Montacargas del Norte" como un socio estratégico en soluciones de RENTA DE MONTACARGAS de alta disponibilidad en San Luis Potosí.
    
    Tono: Extremadamente profesional, respetuoso y enfocado en la eficiencia operativa. Evita lenguaje excesivamente comercial; enfócate en la continuidad del negocio.
    
    Estructura:
    1. Saludo formal (Estimado Ing./Lic. ${nombre}).
    2. Contexto industrial (Importancia de la continuidad operativa en la planta de ${empresa}).
    3. Propuesta de valor (Reducción de riesgos de paro mediante equipos de respaldo inmediatos).
    4. Cierre formal y solicitud de una breve llamada de cortesía.
    
    Idioma: Español de México formal.
    `;

    const data = JSON.stringify({
        contents: [{
            parts: [{ text: promptText }]
        }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.error) {
                        reject('Error de API: ' + JSON.stringify(json.error, null, 2));
                    } else if (json.candidates && json.candidates[0].content.parts[0].text) {
                        resolve(json.candidates[0].content.parts[0].text);
                    } else {
                        reject('Respuesta inesperada: ' + body);
                    }
                } catch (e) {
                    reject('Error al parsear respuesta: ' + e.message + '\nBody: ' + body);
                }
            });
        });

        req.on('error', (e) => reject('Error de conexión: ' + e.message));
        req.write(data);
        req.end();
    });
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const nombre = args[0] || "Ing. Rodriguez";
    const puesto = args[1] || "Gerente de Logística";
    const empresa = args[2] || "General Motors SLP";

    console.log(`--- GENERANDO MENSAJE PARA ${empresa} ---\n`);
    generarMensaje(nombre, puesto, empresa)
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.error("ERROR:", err);
        });
}
