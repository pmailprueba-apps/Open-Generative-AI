import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function main() {
  const usersRef = db.collection("usuarios");
  const snap = await usersRef.get();
  console.log("Total users:", snap.docs.length);
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`- ID: ${d.id}, Email: ${data.email}, Rol: ${data.rol}, Role: ${data.role}`);
  });
}

main().catch(console.error);
