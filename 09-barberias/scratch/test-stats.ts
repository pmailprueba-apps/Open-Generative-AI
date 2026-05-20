import { getMetricasNegocioServer } from "./src/lib/citas-server";

async function run() {
  try {
    const r = await getMetricasNegocioServer("barberia_prueba_01");
    console.log("Stats success:", r);
  } catch(e) {
    console.log("Stats error:", e);
  }
}
run();
