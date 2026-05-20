const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function fix() {
  const targetUid = "GSIqZmGxsvS1HoOxSam6QUFqcqr2";
  
  // 1. Get user and custom claims
  const userRecord = await admin.auth().getUser(targetUid);
  const currentClaims = userRecord.customClaims || {};
  console.log("Current claims:", currentClaims);
  
  // 2. Add barbero_id to custom claims
  const newClaims = { ...currentClaims, barbero_id: targetUid };
  await admin.auth().setCustomUserClaims(targetUid, newClaims);
  console.log("New claims set:", newClaims);
  
  // 3. Update Firestore doc
  const db = admin.firestore();
  await db.collection("usuarios").doc(targetUid).set({
    barbero_id: targetUid
  }, { merge: true });
  console.log("Firestore updated");
}

fix().catch(console.error);
