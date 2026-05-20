import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const usersRef = collection(db, "usuarios");
  const snap = await getDocs(usersRef);
  const users = snap.docs.map(d => ({id: d.id, ...(d.data() as any)}));
  console.log("Usuarios en BD:");
  users.forEach(u => {
    console.log(`- ${u.email}: rol='${u.rol}', role='${u.role}'`);
  });
}

main().catch(console.error);
