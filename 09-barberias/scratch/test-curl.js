const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
admin.auth().createCustomToken("QOST05iwc7XYzNALL6BvnNdxfcu2", { role: "admin" }).then(console.log);
