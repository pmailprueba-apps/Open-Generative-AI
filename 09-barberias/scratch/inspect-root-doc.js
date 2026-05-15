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

async function inspectRootDoc() {
  try {
    const db = admin.firestore();
    const docId = "Ob4CzarKK1dt4OCW4MfQ";
    const doc = await db.collection('citas').doc(docId).get();

    if (doc.exists) {
      console.log("Documento en ROOT citas encontrado:");
      console.log(JSON.stringify(doc.data(), null, 2));
    } else {
      console.log("El documento no existe en ROOT.");
    }
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e.message);
    process.exit(1);
  }
}
inspectRootDoc();
