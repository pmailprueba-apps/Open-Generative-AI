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

async function checkAppointment() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('citas')
      .where('fecha', '>=', '2026-05-17')
      .where('fecha', '<', '2026-05-18')
      .get();

    if (snapshot.empty) {
      console.log("No se encontró ninguna cita para el 17-05-2026.");
    } else {
      console.log(`Se encontraron ${snapshot.size} citas:`);
      snapshot.forEach(doc => {
        console.log(`ID: ${doc.id} | Data: ${JSON.stringify(doc.data(), null, 2)}`);
      });
    }
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e.message);
    process.exit(1);
  }
}
checkAppointment();
