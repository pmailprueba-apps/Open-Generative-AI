import { getAdminDb } from "./src/lib/firebase-admin";

async function run() {
  const db = getAdminDb();
  const doc = await db.collection("usuarios").doc("yyw8S7077xdrC2Jmju4vG7y7Ix73").get();
  console.log(doc.data());
}
run();
