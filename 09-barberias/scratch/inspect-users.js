const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const privateKey = envConfig.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/['"]/g, "").trim();

admin.initializeApp({
  credential: admin.credential.cert({ 
    projectId: envConfig.FIREBASE_PROJECT_ID, 
    clientEmail: envConfig.FIREBASE_CLIENT_EMAIL, 
    privateKey: privateKey 
  })
});

async function inspectUsers() {
  try {
    const db = admin.firestore();
    const snap = await db.collection('usuarios').limit(5).get();

    console.log(`Encontrados ${snap.size} usuarios:`);
    snap.forEach(doc => {
      console.log(`UID: ${doc.id}`);
      console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e.message);
    process.exit(1);
  }
}
inspectUsers();
