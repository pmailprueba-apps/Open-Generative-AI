import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const targetUid = "GSIqZmGxsvS1HoOxSam6QUFqcqr2";
    const auth = getAdminAuth();
    const db = getAdminDb();
    
    const userRecord = await auth.getUser(targetUid);
    const currentClaims = userRecord.customClaims || {};
    
    const newClaims = { ...currentClaims, barbero_id: targetUid };
    await auth.setCustomUserClaims(targetUid, newClaims);
    
    await db.collection("usuarios").doc(targetUid).set({
      barbero_id: targetUid
    }, { merge: true });
    
    return NextResponse.json({ success: true, newClaims });
  } catch(e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
