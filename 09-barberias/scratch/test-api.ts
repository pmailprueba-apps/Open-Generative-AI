import { getAdminDb } from "./src/lib/firebase-admin";

async function test() {
  const db = getAdminDb();
  try {
    const q = db.collection("barberias").doc("barberia_prueba_01").collection("citas").where("estado", "==", "pendiente");
    const s = await q.get();
    console.log("Pendientes found:", s.docs.map(d => d.data()));
  } catch(e) {
    console.log("Error:", e);
  }
}

test();
