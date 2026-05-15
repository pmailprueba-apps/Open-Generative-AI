import { NextRequest, NextResponse } from "next/server";
import { canjearPuntosServer } from "@/lib/puntos-server";
import { verifyAuth } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    const db = getAdminDb();
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ puntos: 0, historial: [] });
    }

    const puntos = userDoc.data()?.puntos || 0;
    
    // Obtener historial reciente
    const historialSnap = await db.collection("usuarios")
      .doc(user.uid)
      .collection("puntos_historial")
      .orderBy("fecha", "desc")
      .limit(10)
      .get();
    
    const historial = historialSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.()?.toISOString() || new Date().toISOString()
    }));

    return NextResponse.json({ puntos, historial });
  } catch (error) {
    console.error("Error getPuntos:", error);
    return NextResponse.json({ error: "Error obteniendo puntos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    const body = await request.json();
    const { puntosRequeridos, recompensa } = body;

    if (!puntosRequeridos || typeof puntosRequeridos !== "number") {
      return NextResponse.json({ error: "puntosRequeridos requerido" }, { status: 400 });
    }

    const resultado = await canjearPuntosServer(user.uid, puntosRequeridos, recompensa);

    if (!resultado.success) {
      return NextResponse.json({ error: resultado.error }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canjearPuntos:", error);
    return NextResponse.json({ error: "Error canjeando puntos" }, { status: 500 });
  }
}