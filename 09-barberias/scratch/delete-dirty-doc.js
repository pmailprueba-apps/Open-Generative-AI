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

async function deleteDirtyDoc() {
  try {
    const db = admin.firestore();
    const docId = "Ob4CzarKK1dt4OCW4MfQ";
    await db.collection('citas').doc(docId).delete();
    console.log("Documento sucio en ROOT eliminado correctamente.");
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e.message);
    process.exit(1);
  }
}
deleteDirtyDoc();
