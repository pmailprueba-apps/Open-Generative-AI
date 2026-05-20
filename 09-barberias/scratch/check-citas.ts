import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '/Users/macbook/Proyectos/09-barberias/.env.local' });

const saStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}';
console.log('Service account loaded, length: ', saStr.length);
const serviceAccount = JSON.parse(saStr);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function main() {
  const barberias = await db.collection('barberias').get();
  for (const b of barberias.docs) {
    console.log(`Barberia: ${b.id} - ${b.data().nombre}`);
    const citas = await b.ref.collection('citas').get();
    console.log(`Citas count: ${citas.docs.length}`);
    for (const c of citas.docs) {
      console.log(` - ${c.id}: ${JSON.stringify(c.data())}`);
    }
  }
}

main().catch(console.error);
