import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    
    // Get all citas
    const snap = await db.collection("barberias").doc("barberia_prueba_01").collection("citas").get();
    const citas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    return NextResponse.json({ success: true, count: citas.length, citas });
  } catch(e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
