const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const privateKey = envConfig.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/['"]/g, "").trim();

admin.initializeApp({
  credential: admin.credential.cert({ 
    projectId: envConfig.FIREBASE_PROJECT_ID, 
    clientEmail: envConfig.FIREBASE_CLIENT_EMAIL, 
    privateKey: privateKey 
  })
});

async function checkSubcollection() {
  try {
    const db = admin.firestore();
    const barberiaId = "barberia_prueba_01";
    
    console.log(`Buscando en subcolección barberias/${barberiaId}/citas...`);
    const snapshot = await db.collection('barberias').doc(barberiaId).collection('citas').get();

    console.log(`Se encontraron ${snapshot.size} citas en total.`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | Fecha: ${data.fecha} | Hora: ${data.hora} | Estado: ${data.estado} | Cliente: ${data.cliente_id}`);
    });
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e.message);
    process.exit(1);
  }
}
checkSubcollection();
