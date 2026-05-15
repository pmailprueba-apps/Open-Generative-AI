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

async function listAllCitas() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('citas').orderBy('fecha', 'desc').limit(20).get();

    console.log(`Últimas ${snapshot.size} citas en el sistema:`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | Fecha: ${data.fecha} | Hora: ${data.hora} | Estado: ${data.estado} | Cliente: ${data.cliente_nombre}`);
    });
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e.message);
    process.exit(1);
  }
}
listAllCitas();
