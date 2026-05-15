import { getAdminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { PUNTOS_POR_PESOS } from "./constants";

/**
 * Acumular puntos tras una cita completada (Servidor).
 */
export async function acumularPuntosServer(
  usuarioId: string,
  montoPesos: number,
  citaId?: string
): Promise<number> {
  const puntosGanados = Math.floor(montoPesos / PUNTOS_POR_PESOS);
  const db = getAdminDb();
  const userRef = db.collection("usuarios").doc(usuarioId);
  
  await db.runTransaction(async (transaction) => {
    transaction.update(userRef, {
      puntos: FieldValue.increment(puntosGanados),
      actualizado_en: FieldValue.serverTimestamp()
    });

    // Registrar historial
    const historialRef = db.collection("usuarios").doc(usuarioId).collection("puntos_historial").doc();
    transaction.set(historialRef, {
      tipo: "acumulacion",
      puntos: puntosGanados,
      monto: montoPesos,
      citaId: citaId || null,
      descripcion: `Cita completada ($${montoPesos})`,
      fecha: FieldValue.serverTimestamp()
    });
  });
  
  return puntosGanados;
}

/**
 * Canjear puntos (Servidor).
 */
export async function canjearPuntosServer(
  usuarioId: string,
  puntosRequeridos: number,
  recompensa: string = "Recompensa"
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminDb();
  const userRef = db.collection("usuarios").doc(usuarioId);
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRef);

    if (!doc.exists) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const puntosActuales = doc.data()?.puntos || 0;

    if (puntosActuales < puntosRequeridos) {
      return { success: false, error: "Puntos insuficientes" };
    }

    transaction.update(userRef, {
      puntos: FieldValue.increment(-puntosRequeridos),
      actualizado_en: FieldValue.serverTimestamp()
    });

    // Registrar historial
    const historialRef = db.collection("usuarios").doc(usuarioId).collection("puntos_historial").doc();
    transaction.set(historialRef, {
      tipo: "canje",
      puntos: -puntosRequeridos,
      descripcion: `Canje por: ${recompensa}`,
      fecha: FieldValue.serverTimestamp()
    });

    return { success: true };
  });
}
