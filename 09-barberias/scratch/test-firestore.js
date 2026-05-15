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

async function testFirestore() {
  try {
    const db = admin.firestore();
    await db.collection('test_auth').add({ timestamp: admin.firestore.FieldValue.serverTimestamp(), message: "Testing auth after fix" });
    console.log("FIRESTORE SUCCESS! Write operation worked.");
    process.exit(0);
  } catch (e) {
    console.log("FIRESTORE FAILED:", e.message);
    process.exit(1);
  }
}
testFirestore();
